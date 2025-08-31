import React, { useEffect, useState } from 'react';
import type { Message } from '../types';
import ReplyComponent from './ReplyComponent';
import ReplyForm from './ReplyForm';

interface Props {
  message: Message;
  onReplyPosted: () => void;
}

const LOCATIONIQ_API_KEY = "YOUR_API_KEY";

export default function MessageComponent({ message, onReplyPosted }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false); // NEW: toggle replies
  const [districtName, setDistrictName] = useState<string>("");

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReplyPosted();
  };

  // Fetch district name using LocationIQ reverse geocoding
  useEffect(() => {
    async function fetchDistrict(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
        );
        const data = await res.json();
        const address = data.address;
        const district = address?.county || address?.state_district || "";
        setDistrictName(district);
      } catch (err) {
        console.error("Error fetching district:", err);
      }
    }

    fetchDistrict(message.lat, message.lon);
  }, [message.lat, message.lon]);

  return (
    <li className="message-card relative p-4 border rounded-md shadow-sm">
      <p className="message-text">{message.text}</p>

      {/* Lower-right corner: timestamp and district */}
      <small className="absolute bottom-2 right-2 text-gray-500 text-xs">
        {new Date(message.timestamp).toLocaleString()}
        {districtName ? ` · ${districtName}` : ""}
      </small>

      <div className="actions mt-6 flex gap-4">
        <button
          className="btn-link"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? 'Cancel Reply' : `Reply (${message.replies.length})`}
        </button>

        {message.replies.length > 0 && (
          <button
            className="btn-link"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? ' Hide Replies' : ` Show Replies (${message.replies.length})`}
          </button>
        )}
      </div>

      {showReplyForm && (
        <ReplyForm
          messageId={message.id}
          onPosted={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {showReplies && message.replies.length > 0 && (
        <div className="replies mt-2">
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
