import { useState, useRef, FC } from 'react';
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
import styles from '../../styles/components/organisms/SearchDropdown.module.scss';
import SearchInput from '../molecules/SearchInput';
import useMobileQuery from '../../hooks/useMobileQuery';
import useOuterClick from '../../hooks/useOuterClick';
import { SearchPayload } from '../../types';
import SearchPanel, { SearchPanelProps } from './SearchPanel';

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

const SearchDropdown: FC<SearchPanelProps> = props => {
  const { onCoursePress, style, ...searchPanelProps } = props || {};
  const [searchPayload, setSearchPayload] = useState<SearchPayload | null>(
    null
  );
  const [visible, setVisible] = useState(false);
  const isMobile = useMobileQuery();

  const inputRef = useRef<HTMLInputElement>(null);
  const searchDropDownRef = useOuterClick(e => {
    console.log('Clicked outside');
    console.log(e.target);
    setVisible(false);
    setSearchPayload(null);
  }, !visible);

  const onSubmitSearch = e => {
    e.preventDefault();
  };

  return (
    <div
      className={clsx(
        styles.searchDropdown,
        'column',
        visible && 'active',
        style
      )}
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
          style={styles.searchPanel}
          searchPayloadProp={searchPayload}
          onCoursePress={courseId => {
            setSearchPayload(null);
            setVisible(false);
            onCoursePress && onCoursePress(courseId);
          }}
          setSearchPayloadProp={setSearchPayload}
          {...searchPanelProps}
        />
      )}
    </div>
  );
};

export default SearchDropdown;
