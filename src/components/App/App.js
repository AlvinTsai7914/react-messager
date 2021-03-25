import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const API_ENDPOINT = 'https://student-json-api.lidemy.me/comments?_sort=createdAt&_order=desc';

const Page = styled.div`
  width: 360px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
`;
const MessageForm = styled.form``;

const MessageNickname = styled.input``;

const MessageTextArea = styled.textarea`
  display: block;
  width: 100%;
  margin-top: 8px;
`;

const SubmitButton = styled.button`
  margin-top: 8px;
`;

const MessageList = styled.div`
  margin-top: 16px;
`;

const MessageContainer = styled.div`
  border: 1px solid black;
  padding: 8px 16px;
  border-radius: 8px;

  & + & {
    margin-top: 8px;
  }
`;

const MessageHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  padding-bottom: 4px;
`;

const MessageAuthor = styled.div`
  color: #00739a;
  font-size: 14px;
`;
const MessageTime = styled.div``;
const MessageBody = styled.div`
  font-size: 16px;
  margin-top: 16px;
`;
const ErrorMessage = styled.div`
  margin-top: 16px;
  color: red;
`;

const Loading = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Message({ author, time, children }) {
  return (
    <MessageContainer>
      <MessageHead>
        <MessageAuthor>{author}</MessageAuthor>
        <MessageTime>{time}</MessageTime>
      </MessageHead>
      <MessageBody>{children}</MessageBody>
    </MessageContainer>
  );
}

Message.propTypes = {
  author: PropTypes.string,
  time: PropTypes.string,
  children: PropTypes.node,
};

function App() {
  const [messages, setMessages] = useState(null);
  const [messageApiError, setMessageApiError] = useState(null);
  const [value, setValue] = useState({ nickname: '', body: '' });
  const [postMessageError, setPostMessageError] = useState();
  const [isLoadingPostMessage, setIsLoadingPostMessage] = useState(false);

  const fetchMessage = () => {
    return fetch(API_ENDPOINT)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => {
        setMessageApiError(err.message);
      });
  };

  const handleInputChange = (e) => {
    setValue({ ...value, [e.target.name]: e.target.value });
  };

  // const handleTextAreaChange = (e) => {
  //   setValue({ ...value, [e.target.name]: e.target.value });
  // };

  const handleInputFocus = (e) => {
    setPostMessageError(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isLoadingPostMessage) {
      return;
    }
    let { nickname, body } = value;
    setIsLoadingPostMessage(true);
    fetch('https://student-json-api.lidemy.me/comments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        nickname,
        body,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoadingPostMessage(false);
        if (data.ok === 0) {
          setPostMessageError(data.message);
          return;
        }
        setValue({ nickname: '', body: '' });
        fetchMessage();
      })
      .catch((err) => {
        setIsLoadingPostMessage(false);
        setPostMessageError(err.message);
      });
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  return (
    <Page>
      {isLoadingPostMessage && <Loading>Loading...</Loading>}
      <Title>留言板</Title>
      <MessageForm onSubmit={handleFormSubmit}>
        暱稱：
        <MessageNickname
          name="nickname"
          value={value.nickname}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        <MessageTextArea
          name="body"
          value={value.body}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          rows={10}
        />
        <SubmitButton>送出</SubmitButton>
        {postMessageError && <ErrorMessage>{postMessageError}</ErrorMessage>}
      </MessageForm>
      {messageApiError && <ErrorMessage>Something went wrong. {messageApiError.toString()}</ErrorMessage>}
      {messages && messages.length === 0 && <div>no message</div>}
      <MessageList>
        {messages &&
          messages.map((message) => {
            return (
              <Message key={message.id} author={message.nickname} time={new Date(message.createdAt).toLocaleString()}>
                {message.body}
              </Message>
            );
          })}
      </MessageList>
    </Page>
  );
}

export default App;
