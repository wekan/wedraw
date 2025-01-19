import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { LinksCollection } from '../api/links';
import { Excalidraw } from '@excalidraw/excalidraw';
import { Hello } from './Hello.jsx';

export const Info = () => {
  const isLoading = useSubscribe('links');
  const links = useFind(() => LinksCollection.find());

  if(isLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Learn Meteor!</h2>
      <ul>{links.map(
        link => <li key={link._id}>
          <a href={link.url} target="_blank">{link.title}</a>
        </li>
      )}</ul>
    </div>
  );
};

export const ExcalidrawComponent = () => {
  const onChange = (elements, state) => {
    console.log("Elements:", elements);
    console.log("State:", state);
  };

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        onChange={onChange}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveAsImage: true,
          }
        }}
      />
    </div>
  );
};

export const App = () => (
  <div>
    <h1>Welcome to Meteor!</h1>
    <Hello/>
    <Info/>
    <ExcalidrawComponent/>
  </div>
);

