import React, { useEffect, useState } from 'react';
import type { Message } from '../types';
import ReplyComponent from './ReplyComponent';
import ReplyForm from './ReplyForm';

interface Props {
  message: Message;
  onReplyPosted: () => void;
  userLat: number; // current user latitude
  userLon: number; // current user longitude
}

const LOCATIONIQ_API_KEY = "API_KEY";

export default function MessageComponent({ message, onReplyPosted, userLat, userLon }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [districtName, setDistrictName] = useState<string>("");
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReplyPosted();
  };

  // Fetch district using LocationIQ
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

  // Compute distance safely
  useEffect(() => {
    if (
      typeof userLat === 'number' &&
      typeof userLon === 'number' &&
      typeof message.lat === 'number' &&
      typeof message.lon === 'number'
    ) {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371000; // meters
      const dLat = toRad(message.lat - userLat);
      const dLon = toRad(message.lon - userLon);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(userLat)) * Math.cos(toRad(message.lat)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistanceMeters(R * c);
    } else {
      setDistanceMeters(null);
    }
  }, [userLat, userLon, message.lat, message.lon]);

  return (
    <li className="message-card relative p-4 border rounded-md shadow-sm">
      <p className="message-text">{message.text}</p>

      {/* Lower-right corner: timestamp, district, distance */}
      <small className="absolute bottom-2 right-2 text-gray-500 text-xs">
        {new Date(message.timestamp).toLocaleString()}
        {districtName ? ` · ${districtName}` : ""}
        {distanceMeters !== null ? ` · ${Math.round(distanceMeters)}m away` : ""}
      </small>

      <div className="actions mt-2">
        <button
          className="btn-link"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? 'Cancel Reply' : `Reply (${message.replies.length})`}
        </button>

        {message.replies.length > 0 && (
          <button
            className="btn-link ml-3"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies
              ? `Hide Replies`
              : `Show Replies (${message.replies.length})`}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-2">
          <ReplyForm
            messageId={message.id}
            onPosted={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {showReplies && message.replies.length > 0 && (
        <div className="replies mt-2 pl-4 border-l border-gray-200">
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
