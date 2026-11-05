/* Run only with an explicitly selected production env file and audited evidence. */
const fs = require('fs');

const { setupEmailer } = require('../lambda/emailer/setup');
const { getTemplateByAction } = require('../lambda/emailer/template');
const { MongoClient, ObjectId } = require('../mongodb/node_modules/mongodb');
const { nanoid } = require('../mongodb/node_modules/nanoid');

const campaign = 'recipient-repair-2026-11';

const recover = async (uri, candidates, apply = false) => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const result = { sent: 0, skipped: 0, failed: 0, eligible: 0 };
  const transporters = setupEmailer();
  try {
    const db = client.db();
    const users = db.collection('users');
    const ledger = db.collection('emailrecoveries');
    for (const candidate of candidates) {
      if (!/^11[0-9]{8}$/.test(candidate.SID)) {
        result.skipped++;
        continue;
      }
      const id = `${campaign}:${candidate._id}`;
      const previous = await ledger.findOne({ _id: id });
      if (previous?.status === 'sent' || previous?.status === 'sending') {
        result.skipped++;
        continue;
      }
      const user = await users.findOne({
        _id: new ObjectId(candidate._id),
        username: candidate.username,
        SID: candidate.SID,
        verified: false,
        veriCode: candidate.veriCode,
      });
      if (!user) {
        result.skipped++;
        continue;
      }
      result.eligible++;
      if (!apply) continue;

      // A unique ledger key makes retries and operator reruns idempotent.
      try {
        if (previous) {
          const claim = await ledger.updateOne(
            { _id: id, status: previous.status },
            { $set: { status: 'sending', startedAt: new Date() } }
          );
          if (!claim.modifiedCount) {
            result.skipped++;
            continue;
          }
        } else {
          await ledger.insertOne({
            _id: id,
            userId: user._id,
            status: 'sending',
            startedAt: new Date(),
          });
        }
      } catch (error) {
        if (error.code === 11000) {
          result.skipped++;
          continue;
        }
        throw error;
      }
      const code = nanoid(5);
      const update = await users.updateOne(
        { _id: user._id, verified: false, veriCode: user.veriCode },
        { $set: { veriCode: code, veriCodeCreatedAt: Date.now() } }
      );
      if (!update.modifiedCount) {
        await ledger.updateOne({ _id: id }, { $set: { status: 'skipped' } });
        result.skipped++;
        continue;
      }
      const mail = getTemplateByAction({
        action: 'create',
        username: user.username,
        SID: user.SID,
        code,
      });
      mail.subject = 'CUtopia account verification — replacement email';
      mail.html =
        'An earlier verification email could not be delivered because of a technical issue. ' +
        'We have fixed the issue. This replacement link and code are valid for 24 hours.<br /><br />' +
        mail.html;
      let receipt;
      for (const transporter of transporters) {
        try {
          const sent = await transporter.sendMail(mail);
          if (sent.accepted?.includes(mail.to)) {
            receipt = sent;
            break;
          }
        } catch (_) {
          // Try the next configured sender without logging credentials or codes.
        }
      }
      if (receipt) {
        await ledger.updateOne(
          { _id: id },
          {
            $set: {
              status: 'sent',
              sentAt: new Date(),
              messageId: receipt.messageId,
              recipient: mail.to,
            },
          }
        );
        result.sent++;
      } else {
        await users.updateOne(
          { _id: user._id, verified: false, veriCode: code },
          {
            $set: { veriCode: user.veriCode },
            ...(user.veriCodeCreatedAt
              ? {
                  $set: {
                    veriCode: user.veriCode,
                    veriCodeCreatedAt: user.veriCodeCreatedAt,
                  },
                }
              : { $unset: { veriCodeCreatedAt: '' } }),
          }
        );
        await ledger.updateOne({ _id: id }, { $set: { status: 'failed' } });
        result.failed++;
        if (result.failed >= 3)
          throw new Error('Recovery stopped after SMTP failures');
      }
      if ((result.sent + result.failed) % 10 === 0) {
        console.log('Recovery progress:', JSON.stringify(result));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return result;
  } finally {
    transporters.forEach(transporter => transporter.close());
    await client.close();
  }
};

if (require.main === module) {
  const [envFile, evidenceFile, mode] = process.argv.slice(2);
  if (!envFile || !evidenceFile) {
    throw new Error(
      'Usage: node recover-verification.js ENV_FILE CONFIRMED_CANDIDATES [--apply]'
    );
  }
  const env = require('../lambda/emailer/node_modules/dotenv').parse(
    fs.readFileSync(envFile)
  );
  Object.assign(process.env, env);
  recover(
    env.ATLAS_URI,
    JSON.parse(fs.readFileSync(evidenceFile)),
    mode === '--apply'
  )
    .then(result => console.log('Recovery result:', JSON.stringify(result)))
    .catch(error => {
      console.error('Recovery stopped:', error.code || error.name);
      process.exitCode = 1;
    });
}

module.exports = { recover };
