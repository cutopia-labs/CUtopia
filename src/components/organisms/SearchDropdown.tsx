import './SearchDropdown.scss';

import { useState, useRef } from 'react';
import {
  ChatBubble,
  ChatBubbleOutlineOutlined,
  Home,
  HomeOutlined,
  Note,
  NoteOutlined,
} from '@material-ui/icons';
import clsx from 'clsx';

import { BsChatDots, BsFillChatDotsFill } from 'react-icons/bs';
import SearchPanel from '../forum/SearchPanel';
import './Header.scss';
import SearchInput from '../molecules/SearchInput';
import useMobileQuery from '../../helpers/useMobileQuery';
import useOuterClick from '../../helpers/useOuterClick';
import { SearchPayload } from '../../types';

const SECTIONS = [
  {
    icon: <HomeOutlined />,
    filledIcon: <Home />,
    label: 'Home',
    link: '/',
  },
  {
    icon: <ChatBubbleOutlineOutlined />,
    filledIcon: <ChatBubble />,
    label: 'Review',
    link: '/review',
  },
  {
    icon: <BsChatDots />,
    filledIcon: <BsFillChatDotsFill />,
    label: 'Discussion',
    link: '/discussion',
  },
  {
    icon: <NoteOutlined />,
    filledIcon: <Note />,
    label: 'Planner',
    link: '/planner',
  },
];

const SearchDropdown = () => {
  const [searchPayload, setSearchPayload] = useState<SearchPayload | null>(
    null
  );
  const [visible, setVisible] = useState(false);
  const isMobile = useMobileQuery();

  const inputRef = useRef<HTMLInputElement>(null);
  const searchDropDownRef = useOuterClick((e) => {
    console.log('Clicked outside');
    console.log(e.target);
    setVisible(false);
    setSearchPayload(null);
  }, !visible);

  const onSubmitSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className={clsx('search-dropdown column', visible && 'active')}
      ref={searchDropDownRef}
    >
      <SearchInput
        isMobile={isMobile}
        searchPayload={searchPayload}
        setSearchPayload={setSearchPayload}
        onSubmit={onSubmitSearch}
        inputRef={inputRef}
        visible={visible}
        setVisible={setVisible}
      />
      {visible && (
        <SearchPanel
          searchPayloadProp={searchPayload}
          onCoursePress={() => {
            setSearchPayload(null);
            setVisible(false);
          }}
          setSearchPayloadProp={setSearchPayload}
        />
      )}
    </div>
  );
};

export default SearchDropdown;
