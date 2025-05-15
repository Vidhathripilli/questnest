import { ApiClientLms } from '@/service/ApiUserAccount';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const VoteHandler = ({ type, id, onVoteUpdate }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [currentUserVote, setCurrentUserVote] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Start with true to indicate initial loading
  const user = useSelector((state) => state.auth.user);

  // Fetch initial vote data when component mounts
  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        // Only fetch if we have a valid type and id
        if (type && id) {
          setIsLoading(true);
          const response = await ApiClientLms.get(`api/${type}/${id}/votes`);
          
          if (response.status === 200) {
            const { upvotes, downvotes, userVote } = response.data;
            setLikes(upvotes || 0);
            setDislikes(downvotes || 0);
            setCurrentUserVote(userVote || 0);
          }
        }
      } catch (error) {
        console.error(`Error fetching vote data for ${type}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoteData();
  }, [type, id, user]); // Re-fetch if any of these change

  // Function to handle voting
  const handleVote = async (voteType) => {
    if (!user) {
      alert("Please log in to vote");
      return;
    }

    const voteTypeString = voteType === 1 ? "upvote" : "downvote";
    const isRemovingVote = currentUserVote === voteType;
    
    try {
      // First update UI optimistically
      let newLikes = likes;
      let newDislikes = dislikes;
      let newUserVote = 0;
      
      // Handle removal of vote
      if (isRemovingVote) {
        if (voteType === 1) newLikes = Math.max(0, likes - 1);
        if (voteType === 2) newDislikes = Math.max(0, dislikes - 1);
      } 
      // Handle switching vote
      else if (currentUserVote !== 0 && currentUserVote !== voteType) {
        if (voteType === 1) {
          newLikes = likes + 1;
          newDislikes = Math.max(0, dislikes - 1);
        } else {
          newDislikes = dislikes + 1;
          newLikes = Math.max(0, likes - 1);
        }
        newUserVote = voteType;
      } 
      // Handle new vote
      else {
        if (voteType === 1) newLikes = likes + 1;
        if (voteType === 2) newDislikes = dislikes + 1;
        newUserVote = voteType;
      }
      
      // Update UI immediately
      setLikes(newLikes);
      setDislikes(newDislikes);
      setCurrentUserVote(isRemovingVote ? 0 : voteType);
      
      // Send request to backend
      const response = await ApiClientLms.post(`api/${type}/vote`, {
        [`${type}_id`]: id,
        user_id: user.userId,
        vote_type: isRemovingVote ? "remove" : voteTypeString,
      });
      console.log('ddddddddddddddddd',response)
      
      // If successful, update with server values
      if (response.status === 200) {
        const { upvotes, downvotes, userVote: serverUserVote } = response.data;
        
        // Only update if we got values back
        if (upvotes !== undefined) setLikes(upvotes);
        if (downvotes !== undefined) setDislikes(downvotes);
        if (serverUserVote !== undefined) setCurrentUserVote(serverUserVote);
        
        // Call the callback to update parent components if needed
        if (onVoteUpdate) {
          onVoteUpdate(id, upvotes || newLikes, downvotes || newDislikes, serverUserVote || newUserVote);
        }
      }
      
    } catch (error) {
      console.error(`Error voting on ${type}:`, error);
      // Revert to original state if there's an error
      alert(`Failed to record your vote for ${type}. Please try again.`);
    }
  };

  return (
    <div className="vote-controls">
      {isLoading ? (
        <div className="loading-votes">Loading votes...</div>
      ) : (
        <>
          <button 
            className={`upvote-btn ${currentUserVote === 1 ? 'active' : ''}`}
            onClick={() => handleVote(1)}
            aria-label="Upvote"
            disabled={isLoading}
          >
            <span className="vote-icon">👍</span>
            <span className="vote-count">{likes}</span>
          </button>
          
          <button 
            className={`downvote-btn ${currentUserVote === 2 ? 'active' : ''}`}
            onClick={() => handleVote(2)}
            aria-label="Downvote"
            disabled={isLoading}
          >
            <span className="vote-icon">👎</span>
            <span className="vote-count">{dislikes}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default VoteHandler;