import requests
from PIL import Image
from bs4 import BeautifulSoup
from contextlib import closing
import io
import pytesseract
import json

class Course:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        }
        self.form_headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Upgrade-Insecure-Requests': '1',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        self.course_url = 'http://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/tt_dsp_crse_catalog.aspx'
        self.sess = requests.Session()
        self.courses = {}
        self.form_body = {}

    def parse_all(self):
        self.get_code_list()
        print(f"Parsing courses for all {len(self.code_list)} subjects")
        for code in self.code_list:
            print(f"\nParsing courses for {code.split()[0]}\n")
            self.search_subject(code.split()[0], save=True)

    def get_code_list(self):
        with closing(requests.get(self.course_url, headers=self.headers)) as res:
            soup = BeautifulSoup(res.text, 'html.parser')
            code_list = []
            for node in soup.select('option'):
                code_list.append(node.text)
            self.code_list = list(filter(None, code_list))

    def get_captcha(self, soup:BeautifulSoup, manual=True):
        captcha_id = soup.select_one('#hf_Captcha')['value']
        captcha_url = f'http://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/BuildCaptcha.aspx?captchaname={captcha_id}&len=4'
        with closing(self.sess.get(captcha_url, headers=self.headers)) as captcha_res:
            in_memory_file = io.BytesIO(captcha_res.content)
            im = Image.open(in_memory_file)
            if manual:
                im.show()
                captcha = str(input('Input the captcha here: '))
            else:
                captcha = pytesseract.image_to_string(im) # not working lol, need to do CNN later
                print(f'Recognized captcha: {captcha}')
            self.form_body.update({
                'hf_Captcha': captcha_id,
                'txt_captcha': captcha,
            })

    def update_form(self, soup: BeautifulSoup, update=True, additional_keys=None) -> dict:
        form_body = {'__VIEWSTATEFIELDCOUNT': soup.select_one('#__VIEWSTATEFIELDCOUNT')['value']}
        form_keys = ['__EVENTVALIDATION', '__VIEWSTATEGENERATOR', '__VIEWSTATE'] + [f'__VIEWSTATE{str(i)}' for i in range(1, int(form_body['__VIEWSTATEFIELDCOUNT']))]
        if additional_keys:
            form_keys.extend(additional_keys)
        for k in form_keys:
            id = k.replace('$', '_')
            form_body[k] = soup.select_one(f'#{id}')['value']
        if update:
            self.form_body.update(form_body)
        else:
            return form_body

    def search_subject(self, subject, save=False, manual=True): # get all course under a subject code
        with closing(self.sess.get(self.course_url, headers=self.headers)) as res:
            soup = BeautifulSoup(res.text, 'html.parser')
            self.update_form(soup)
            self.form_body.update({
                'ddl_subject': subject,
                'hf_previous_page': 'SEARCH',
                'hf_max_search_iteration': '1',
                'hf_search_iteration': '1',
            })

            while True:
                self.get_captcha(soup, manual)
                form_body = { 'btn_search': 'Search' }
                form_body.update(self.form_body)
                with closing(self.sess.post(self.course_url, headers=self.form_headers, data=form_body)) as res:
                    correct_captcha = self.parse_subject_courses(subject, res.text, save)
                    if correct_captcha:
                        break
                    else:
                        print("Wrong captcha")
    
    def parse_subject_courses(self, subject, html, save): # parse the courses under a subject and get details of each course
        course_list = []
        soup = BeautifulSoup(html, 'html.parser')
        self.update_form(soup)
        course_detail_node = soup.select_one('#gv_detail')
        if not course_detail_node:
            return False
        course_row_nodes = course_detail_node.findChildren('tr', recursive=False)
        course_row_nodes.pop(0) # remove the header node
        for i, row in enumerate(course_row_nodes):
            a_node = row.select('a')
            course = {
                'code': a_node[0].text,
                'title': a_node[1].text,
            }
            print(f'Posting request {i}')
            num = f'0{i+2}' if i + 2 < 10 else str(i+2)
            form_body = {
                '__EVENTTARGET': f'gv_detail$ctl{num}$lbtn_course_title',
            }
            form_body.update(self.form_body)
            with closing(self.sess.post(self.course_url, headers=self.headers, data=form_body)) as res:
                course_detail = self.parse_course_detail(res.text)
                course.update(course_detail)
            course_list.append(course)
        course_list = sorted(course_list, key=lambda x:x['code'])
        if save:
            with open(f'{subject}.json', 'w') as f:
                json.dump(course_list, f)
        self.courses[subject] = course_list
        return True

    def parse_course_detail(self, html) -> dict:
        # Get general information about the course
        soup = BeautifulSoup(html, 'html.parser')
        course_detail = {
            'career': soup.select_one('#uc_course_lbl_acad_career').text,
            'units': soup.select_one('#uc_course_lbl_units').text,
            'grading': soup.select_one('#uc_course_lbl_grading_basis').text,
            'components': soup.select_one('#uc_course_lbl_component').text,
            'campus': soup.select_one('#uc_course_lbl_campus').text,
            'academic_group': soup.select_one('#uc_course_lbl_acad_group').text,
            'requirements': soup.select_one('#uc_course_tc_enrl_requirement'),
            'description': soup.select_one('#uc_course_lbl_crse_descrlong').text,
            'academic_group': soup.select_one('#uc_course_lbl_acad_group').text,
        }
        course_detail['requirements'] = soup.select_one('#uc_course_tc_enrl_requirement').get_text(';') if course_detail['requirements'] else ''
        
        # Get sections of the course
        try: 
            term_selection_options = soup.select_one('#uc_course_ddl_class_term').findChildren('option', recursive=False)
            for term_node in term_selection_options:
                if term_node.has_attr('selected'):
                    print(f"For term {term_node.text}")
                    course_sections = self.parse_sections(soup)
                else:
                    # post form request to get schedule for non-default term
                    print(f"For non-selected term {term_node.text}")
                    form = {
                        'uc_course$btn_class_section': 'Show sections',
                        'uc_course$ddl_class_term': term_node['value'],
                    }
                    form.update(self.update_form(soup, update=False))
                    with closing(self.sess.post(self.course_url, headers=self.headers, data=form)) as res:
                        soup_alt = BeautifulSoup(res.text, 'html.parser')
                        course_sections = self.parse_sections(soup_alt)
                    pass
                course_detail[term_node.text] = course_sections
                print(course_sections)
            
            # Get course outcome for the course
            form = {
                'btn_course_outcome': 'Course Outcome',
                'uc_course$ddl_class_term': term_selection_options[0]['value'],
                'hf_previous_page': 'SEARCH'
            }
            form.update(self.update_form(soup, update=False, additional_keys=['hf_course_offer_nbr', 'hf_course_id']))
            
            with closing(self.sess.post(self.course_url, headers=self.headers, data=form)) as res:
                soup = BeautifulSoup(res.text, 'html.parser')
                course_detail.update({
                    'outcome': soup.select_one('#uc_course_outcome_lbl_learning_outcome').text,
                    'syllabus': soup.select_one('#uc_course_outcome_lbl_course_syllabus').text,
                    'required_readings': soup.select_one('#uc_course_outcome_lbl_req_reading').text,
                    'recommended_readings': soup.select_one('#uc_course_outcome_lbl_rec_reading').text,
                })
                assessment_nodes = soup.select_one('#uc_course_outcome_gv_ast').findChildren('tr', recursive=False) # if no node, will raise error and return
                assessment_nodes.pop(0)
                assessments = {}
                for tr in assessment_nodes:
                    td_nodes = tr.select('td')
                    assessments[td_nodes[1].text] = td_nodes[2].text
                course_detail['assessments'] = assessments
        except AttributeError:
            print('No section / outcome for this course')
            pass
        return course_detail

    def parse_sections(self, soup: BeautifulSoup) -> dict:
        course_sections = {}
        course_sections_table = soup.select_one('#uc_course_gv_sched').findChildren('tr', recursive=False)
        course_sections_table.pop(0) # remove the header node
        for schedule in course_sections_table:
            # schedule is a <tr> tag with 3 children, first is the section code, second is the reg status, last is course detail table
            children = schedule.findChildren('td', recursive=False)
            section = children[0].text.strip('\n')
            start_times, end_times, days, locations, instructors, meeting_dates = [], [], [], [], [], ''
            timeslots = children[2].findChildren('tr') # each tr is a teaching timeslot, e.g. Wed and Thu Lectures are two teaching timelot
            for node in timeslots:
                details = list(filter(lambda x: x!='\n', node.get_text(';').split(';'))) # 0: days & time 1: Room 2: Instructor 3: part of teaching date
                days_and_times = self.parse_days_and_times(details[0])
                if days_and_times[0] in days and days_and_times[1] in start_times: # i.e. duplicated
                    continue
                days.append(days_and_times[0])
                start_times.append(days_and_times[1])
                end_times.append(days_and_times[2])
                locations.append(details[1])
                instructors.append(details[2])
                meeting_dates += f', {details[3]}'
            course_sections[section] = {
                'startTimes': start_times,
                'endTimes': end_times,
                'days': days,
                'locations': locations,
                'instructors': instructors
            }
        return course_sections

    @staticmethod
    def parse_days_and_times(s: str) -> tuple:
        if s == 'TBA':
            return ('TBA', 'TBA', 'TBA')
        def to_24_hours(s: str):
            if 'PM' in s:
                s = s.replace('PM','')
                t = s.split(':')
                if t[0] != '12':
                    t[0] = str(int(t[0])+12)
                    s = ':'.join(t)
            else:
                s = s.replace('AM','')
            return s
        days_dict = {
            'Mo': 1,
            'Tu': 2,
            'We': 3,
            'Th': 4,
            'Fr': 5,
            'Sa': 6,
            'Su': 0,
        }
        raw = list(filter(lambda x: x!='-', s.split())) # first is 2-letter weekday abbr, second is start time, last is end time
        return (days_dict[raw[0]], to_24_hours(raw[1]), to_24_hours(raw[2]))

cusis = Course()
# cusis.parse_all()
cusis.search_subject('ACCT', save=False)
# print(cusis.courses)

"""
TODO
1. Push to DB
2. replace special char in outcome and syllabus with sth normal
3. Auto captcha
"""
