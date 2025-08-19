import React, { useState } from 'react';
import type { Message } from '../types';
import ReplyComponent from './ReplyComponent';
import ReplyForm from './ReplyForm';

interface Props {
  message: Message;
  onReplyPosted: () => void;
}

export default function MessageComponent({ message, onReplyPosted }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReplyPosted();
  };

  return (
    <li className="message-card">
      <p className="message-text">{message.text}</p>
      <small className="muted">Posted at {new Date(message.timestamp).toLocaleString()}</small>
      <div className="actions">
        <button className="btn-link" onClick={() => setShowReplyForm(!showReplyForm)}>
          {showReplyForm ? 'Cancel Reply' : `Reply (${message.replies.length})`}
        </button>
      </div>

      {showReplyForm && (
        <ReplyForm
          messageId={message.id}
          onPosted={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {message.replies && message.replies.length > 0 && (
        <div className="replies">
          {message.replies.map((reply) => (
            <ReplyComponent
              key={reply.id}
              reply={reply}
              messageId={message.id}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </li>
  );
}