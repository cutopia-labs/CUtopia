data_path=lambda/graphql/src/data

[ -e $data_path ] && rm -r $data_path

mkdir -p $data_path/courses
mkdir -p $data_path/derived

cp -r ../data/courses $data_path
cp ../data/derived/subject_course_names.json $data_path/derived
