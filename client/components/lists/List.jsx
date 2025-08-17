import React from 'react';
import ListHeader from './ListHeader';
import ListBody from './ListBody';

const List = ({ 
  list, 
  isCollapsed = false, 
  isAutoWidth = false, 
  listWidth = 270, 
  listConstraint = 270,
  isMini = false,
  onSelectList
}) => {
  const handleSelectList = () => {
    if (onSelectList) {
      onSelectList(list);
    }
  };

  if (isMini) {
    return (
      <a 
        className="mini-list js-select-list js-list"
        id={`js-list-${list._id}`}
        onClick={handleSelectList}
      >
        <ListHeader list={list} isMini={true} />
      </a>
    );
  }

  return (
    <div 
      className={`list js-list ${isCollapsed ? 'list-collapsed' : ''} ${isAutoWidth ? 'list-auto-width' : ''}`}
      id={`js-list-${list._id}`}
      style={{
        minWidth: isCollapsed ? undefined : `${listWidth}px`,
        maxWidth: isCollapsed ? undefined : `${listConstraint}px`
      }}
    >
      <ListHeader list={list} />
      <ListBody list={list} />
    </div>
  );
};

export default List;
