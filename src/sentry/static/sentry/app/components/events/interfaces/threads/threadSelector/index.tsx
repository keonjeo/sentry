import React from 'react';
import styled from '@emotion/styled';
import partition from 'lodash/partition';

import {Thread} from 'app/types/events';
import {Event, EntryTypeData} from 'app/types';
import DropdownAutoComplete from 'app/components/dropdownAutoCompleteV2';
import DropdownButton from 'app/components/dropdownButton';
import theme from 'app/utils/theme';
import {t} from 'app/locale';

import filterThreadInfo from './filterThreadInfo';
import getThreadException from './getThreadException';
import Option from './option';
import SelectedOption from './selectedOption';
import Header from './header';

type Props = {
  threads: Array<Thread>;
  activeThread: Thread;
  event: Event;
  onChange?: (thread: Thread) => void;
};

const DROPDOWN_MAX_HEIGHT = 400;

const ThreadSelector = ({threads, event, activeThread, onChange}: Props) => {
  const getDropDownItem = (thread: Thread) => {
    const threadInfo = filterThreadInfo(thread, event);

    // const dropDownValue = `#${thread.id}: ${thread.name} ${threadInfo.label} ${threadInfo.filename}`;
    let crashedInfo: undefined | EntryTypeData;

    if (thread.crashed) {
      crashedInfo = getThreadException(thread, event);
    }

    return {
      value: thread.id,
      threadInfo,
      label: (
        <Option
          id={thread.id}
          details={threadInfo}
          name={thread.name}
          crashed={thread.crashed}
          crashedInfo={crashedInfo}
        />
      ),
    };
  };

  const getItems = () => {
    const [crashed, notCrashed] = partition(threads, thread => !!thread?.crashed);
    return [...crashed, ...notCrashed].map(getDropDownItem);
  };

  const handleChange = (thread: Thread) => {
    if (onChange) {
      onChange(thread);
    }
  };

  const items = getItems();

  console.log('threads', threads);

  return (
    <StyledDropdownAutoComplete
      items={items}
      onSelect={item => {
        console.log('item', item);
        const selectedThread = threads.find(thread => thread.id === item.value);
        if (selectedThread) {
          handleChange(selectedThread);
        }
      }}
      onChange={item => {
        console.log('okokoko', item);
      }}
      alignMenu="left"
      maxHeight={DROPDOWN_MAX_HEIGHT}
      searchPlaceholder={t('Filter Threads')}
      emptyMessage={t('You have no threads')}
      noResultsMessage={t('No threads found')}
      menuHeader={<Header />}
      emptyHidesInput
    >
      {({isOpen, selectedItemIndex}) => (
        <StyledDropdownButton size="small" isOpen={isOpen} align="left">
          {selectedItemIndex !== undefined ? (
            <SelectedOption
              id={items[selectedItemIndex].value}
              details={items[selectedItemIndex].threadInfo}
            />
          ) : (
            <SelectedOption
              id={activeThread.id}
              details={filterThreadInfo(activeThread, event)}
            />
          )}
        </StyledDropdownButton>
      )}
    </StyledDropdownAutoComplete>
  );
};

export default ThreadSelector;

const StyledDropdownAutoComplete = styled(DropdownAutoComplete)`
  width: 100%;
  min-width: 300px;
  @media (min-width: ${theme.breakpoints[0]}) {
    width: 500px;
  }
  @media (max-width: ${p => p.theme.breakpoints[2]}) {
    top: calc(100% - 2px);
  }
`;

const StyledDropdownButton = styled(DropdownButton)`
  > *:first-child {
    grid-template-columns: 1fr 15px;
  }
  width: 100%;
  min-width: 150px;
  @media (min-width: ${props => props.theme.breakpoints[3]}) {
    max-width: 420px;
  }
`;
