"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import edit from "../assets/icons/social_media_icons/edit.svg";
import { FaStar } from "react-icons/fa";
import { ApiClientLms } from "@/service/ApiUserAccount";
import ReviewSummary from "./ReviewSummary";

export default function QnAReviews() {
  const [selectedTab, setSelectedTab] = useState("qa");
  const [question_id, setQuestion_id] = useState("");
  const [questionData, setQuestionData] = useState({
    question_heading: "",
    question_description: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [ansModel, setAnsModel] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState("");
  const [editingAnswerText, setEditingAnswerText] = useState("");
  const [answerId, setAnswerId] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [reviewHeading, setReviewHeading] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userReview, setUserReview] = useState(null);
  const user = useSelector((state) => state.auth.user);

  // Fetch questions and answers
  const fetchQuestions = async () => {
    try {
      const response = await ApiClientLms.get(`courses/${user.courseId}/questions`);
      console.log("questions", response);
      if (response.status === 200) {
        const questionsWithVotes = response.data.map((q) => ({
          ...q,
          upvotes: q.upvotes || 0,
          downvotes: q.downvotes || 0,
          userVote: q.userVote || 0,
          answers: (q.answers || []).map((a) => ({
            ...a,
            upvotes: a.upvotes || 0,
            downvotes: a.downvotes || 0,
            userVote: a.userVote || 0,
          })),
        }));
        setQuestions(questionsWithVotes);
      }
    } catch (error) {
      console.log("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (user?.courseId) {
      fetchQuestions();
    }
  }, [user?.courseId]);

  // Update question votes in the state
  const updateQuestionVotes = (questionId, upvotes, downvotes, userVote) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, upvotes, downvotes, userVote }
          : q
      )
    );
  };

  // Update answer votes in the state
  const updateAnswerVotes = (questionId, answerId, upvotes, downvotes, userVote) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.map((a) =>
              a.id === answerId
                ? { ...a, upvotes, downvotes, userVote }
                : a
            ),
          };
        }
        return q;
      })
    );
  };

  const handleAnswer = async (question) => {
    const data = {
      answer: answerText,
      question_id: question.id,
      question: question.id,
      author: user.userId,
    };

    try {
      const response = await ApiClientLms.post("api/answers/add", data);
      if (response.status === 201) {
        const newAnswer = {
          ...response.data,
          upvotes: 0,
          downvotes: 0,
          userVote: 0,
        };

        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? { ...q, answers: [...(q.answers || []), newAnswer] }
              : q
          )
        );
        setAnswerId(response.id);
        setAnswerText("");
        setAnsModel(null);
      }
    } catch (error) {
      console.log("Answer error:", error);
    }
  };

  const handleEditAnswer = (answerId, currentText) => {
    setEditingAnswerId(answerId);
    setEditingAnswerText(currentText);
  };

  const handleUpdateAnswer = async (questionId) => {
    const data = {
      answer: editingAnswerText,
      answer_id: editingAnswerId,
      question_id: questionId,
      author: user.userId,
    };

    try {
      const response = await ApiClientLms.patch("api/answers/add", data);
      if (response.status === 200) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: q.answers.map((a) =>
                    a.id === editingAnswerId
                      ? { ...a, answer: editingAnswerText }
                      : a
                  ),
                }
              : q
          )
        );
        setEditingAnswerId(null);
        setEditingAnswerText("");
      }
    } catch (error) {
      console.log("Answer update error:", error);
    }
  };

  const fetchQuestion = async (e) => {
    e.preventDefault();
    const data = {
      ...questionData,
      course_id: user.courseId,
      author: user.userId,
    };

    try {
      const response = await ApiClientLms.post(`add-question`, data);
      if (response.status === 200 || response.status === 201) {
        const newQuestion = {
          id: response.data.id || response.data.question_id,
          question_heading: questionData.question_heading,
          question_description: questionData.question_description,
          upvotes: 0,
          downvotes: 0,
          userVote: 0,
          answers: [],
          created_at: new Date().toISOString(),
          user: user.name || "You",
        };

        setQuestion_id(newQuestion.id);
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
        setQuestionData({ question_heading: "", question_description: "" });
      }
    } catch (error) {
      console.log("Error adding question:", error);
    }
  };

  const openEdit = (question) => {
    setEditingQuestionId(question.id);
    setQuestionData({
      question_heading: question.question_heading,
      question_description: question.question_description,
    });
    setIsEditModalOpen(true);
  };

  const updateQuestion = async (e) => {
    e.preventDefault();
    const data = {
      ...questionData,
      course_id: user.courseId,
      author: user.userId,
      question_id: editingQuestionId,
    };

    try {
      const response = await ApiClientLms.patch(`add-question`, data);
      if (response.status === 200) {
        setIsEditModalOpen(false);
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === editingQuestionId ? { ...q, ...data } : q
          )
        );
        setQuestionData({ question_heading: "", question_description: "" });
        setEditingQuestionId(null);
      }
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const response = await ApiClientLms.get(`course/${user.courseId}/reviews`);
        if (response.status === 200) {
          setAllReviews(response.data);
        }
      } catch (error) {
        console.log("Error fetching all reviews:", error);
      }
    };

    if (user?.courseId) {
      fetchAllReviews();
    }
  }, [user?.courseId, userReview]);

  const handleReviewSubmit = async () => {
    const payload = {
      author: user.userId,
      site: 1,
      review_heading: reviewHeading,
      review: comment,
      rating: rating,
    };

    try {
      let response = await ApiClientLms.post(
        `course/${user.courseId}/submit-review`,
        payload,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        setUserReview(response.data);
        setAllReviews((prev) => {
          if (userReview) {
            return prev.map((review) =>
              review.id === userReview.id ? response.data : review
            );
          } else {
            return [...prev, response.data];
          }
        });
        if (!userReview) {
          setRating(0);
          setReviewHeading("");
          setComment("");
        }
      }
    } catch (error) {
      console.log("Review error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const getUserReview = async () => {
      try {
        const response = await ApiClientLms.get(
          `course/${user.courseId}/user-review/${user.userId}`
        );
        if (response.status === 200 && response.data) {
          setUserReview(response.data);
          setRating(response.data.rating);
          setReviewHeading(response.data.review_heading);
          setComment(response.data.review);
        }
      } catch (error) {
        console.log("No user review found");
      }
    };

    if (user?.courseId && user?.userId) {
      getUserReview();
    }
  }, [user?.courseId, user?.userId]);

  // VoteHandler component integrated directly into QnAReviews
  const VoteHandler = ({
    type,
    id,
    questionId,
    initialUpvotes = 0,
    initialDownvotes = 0,
    initialUserVote = 0,
    onVoteUpdate,
    size = "regular",
  }) => {
    const [likes, setLikes] = useState(initialUpvotes);
    const [dislikes, setDislikes] = useState(initialDownvotes);
    const [currentUserVote, setCurrentUserVote] = useState(initialUserVote);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      setLikes(initialUpvotes);
      setDislikes(initialDownvotes);
      setCurrentUserVote(initialUserVote);
    }, [initialUpvotes, initialDownvotes, initialUserVote]);

    const handleVote = async (voteType) => {
      if (!user) {
        alert("Please log in to vote");
        return;
      }

      const voteTypeString = voteType === 1 ? "upvote" : "downvote";
      const isRemovingVote = currentUserVote === voteType;

      try {
        // Optimistic UI update
        let newLikes = likes;
        let newDislikes = dislikes;
        let newUserVote = isRemovingVote ? 0 : voteType;

        if (isRemovingVote) {
          if (voteType === 1) newLikes = Math.max(0, likes - 1);
          if (voteType === 2) newDislikes = Math.max(0, dislikes - 1);
        } else if (currentUserVote !== 0 && currentUserVote !== voteType) {
          if (voteType === 1) {
            newLikes = likes + 1;
            newDislikes = Math.max(0, dislikes - 1);
          } else {
            newDislikes = dislikes + 1;
            newLikes = Math.max(0, likes - 1);
          }
        } else {
          if (voteType === 1) newLikes = likes + 1;
          if (voteType === 2) newDislikes = dislikes + 1;
        }

        setLikes(newLikes);
        setDislikes(newDislikes);
        setCurrentUserVote(newUserVote);

        const payload = {
          user_id: user.userId,
          vote_type: isRemovingVote ? "remove" : voteTypeString,
        };

        if (type === "question") {
          payload.question_id = id;
        } else if (type === "answer") {
          payload.answer_id = id;
        }

        setIsLoading(true);
        const endpoint = `api/${type}/vote`;
        const voteResponse = await ApiClientLms.post(endpoint, payload);

        if (voteResponse.status === 200) {
          // Refetch questions to get updated vote counts
          await fetchQuestions();
        }
        console.log("Vote response:", voteResponse);
      } catch (error) {
        console.error(`Error voting on ${type}:`, error);
        alert(`Failed to record your vote for ${type}. Please try again.`);
        setLikes(initialUpvotes);
        setDislikes(initialDownvotes);
        setCurrentUserVote(initialUserVote);
      } finally {
        setIsLoading(false);
      }
    };

    const btnClass =
      size === "small" ? "text-xs px-1.5 py-0.5 mx-0.5" : "text-sm px-2 py-1 mx-1";
    const voteCountClass = size === "small" ? "text-xs ml-1" : "text-sm ml-1";

    return (
      <div className="vote-controls flex items-center">
        {isLoading ? (
          <div className="loading-votes text-xs text-gray-400">Loading...</div>
        ) : (
          <>
            <button
              className={`upvote-btn ${btnClass} rounded flex items-center ${
                currentUserVote === 1 ? "bg-blue-100 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => handleVote(1)}
              aria-label="Upvote"
              disabled={isLoading}
            >
              <span className="vote-icon">👍</span>
              <span className={`vote-count ${voteCountClass}`}>{likes}</span>
            </button>
            <button
              className={`downvote-btn ${btnClass} rounded flex items-center ${
                currentUserVote === 2 ? "bg-red-100 text-red-600" : "text-gray-500"
              }`}
              onClick={() => handleVote(2)}
              aria-label="Downvote"
              disabled={isLoading}
            >
              <span className="vote-icon">👎</span>
              <span className={`vote-count ${voteCountClass}`}>{dislikes}</span>
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-[586px] h-[398px] p-6 ">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-semibold ${
            selectedTab === "qa"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("qa")}
        >
          Questions & Answers
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            selectedTab === "reviews"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {selectedTab === "qa" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">
            All questions in this course ({questions.length})
          </h3>

          {questions.map((q) => (
            <div key={q.id} className="border rounded-lg p-4 shadow bg-gray-50">
              <div className="flex gap-3">
                <img
                  src="https://i.pravatar.cc/40"
                  className="w-10 h-10 rounded-full"
                  alt="avatar"
                />
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {q.question_heading}
                    <Image
                      src={edit}
                      alt="edit"
                      className="cursor-pointer w-4 h-4"
                      onClick={() => openEdit(q)}
                    />
                  </div>
                  {isEditModalOpen && editingQuestionId === q.id && (
                    <div className="fixed inset-0 bg-gray-300 bg-opacity-10 flex justify-center items-center z-50">
                      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Question</h2>
                        <form onSubmit={updateQuestion}>
                          <input
                            type="text"
                            name="question_heading"
                            placeholder="Title"
                            value={questionData.question_heading}
                            onChange={handleChange}
                            className="w-full border mb-3 p-2 rounded"
                          />
                          <textarea
                            name="question_description"
                            placeholder="Description"
                            rows={4}
                            value={questionData.question_description}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                          />
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              onClick={() => setIsEditModalOpen(false)}
                              className="mr-2 px-4 py-2 border rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    {new Date(q.created_at).toLocaleString()} · {q.user || "Anonymous"}
                  </div>
                  <p className="text-gray-500 mt-2">{q.question_description}</p>
                  <p className="text-gray-500 mt-2">Answers</p>
                  <div className="mt-2 space-y-2">
                    {q.answers && q.answers.length > 0 ? (
                      q.answers.map((ans, i) => (
                        <div key={i} className="bg-white border p-2 rounded shadow-sm">
                          {editingAnswerId === ans.id ? (
                            <div>
                              <textarea
                                className="w-full border p-2 rounded"
                                value={editingAnswerText}
                                onChange={(e) => setEditingAnswerText(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end mt-2">
                                <button
                                  className="bg-green-500 text-white px-3 py-1 rounded"
                                  onClick={() => handleUpdateAnswer(q.id)}
                                >
                                  Update
                                </button>
                                <button
                                  className="bg-gray-300 px-3 py-1 rounded"
                                  onClick={() => {
                                    setEditingAnswerId(null);
                                    setEditingAnswerText("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{ans.answer}</p>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-xs text-gray-500 flex items-center">
                                  <span>— {ans.user || "Anonymous"}</span>
                                  <button
                                    onClick={() => handleEditAnswer(ans.id, ans.answer)}
                                    className="text-blue-600 text-xs ml-2"
                                  >
                                    Edit
                                  </button>
                                </div>
                                <VoteHandler
                                  id={ans.id}
                                  questionId={q.id}
                                  type="answer"
                                  initialUpvotes={ans.upvotes}
                                  initialDownvotes={ans.downvotes}
                                  initialUserVote={ans.userVote}
                                  onVoteUpdate={(id, upvotes, downvotes, userVote) =>
                                    updateAnswerVotes(q.id, id, upvotes, downvotes, userVote)
                                  }
                                  size="small"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No answers yet.</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setAnsModel(q.id);
                        setAnswerText("");
                      }}
                    >
                      Answer
                    </button>
                    <div className="ml-auto">
                      <VoteHandler
                        id={q.id}
                        type="question"
                        initialUpvotes={q.upvotes}
                        initialDownvotes={q.downvotes}
                        initialUserVote={q.userVote}
                        onVoteUpdate={(id, upvotes, downvotes, userVote) =>
                          updateQuestionVotes(id, upvotes, downvotes, userVote)
                        }
                      />
                    </div>

                    {ansModel === q.id && (
                      <div className="fixed inset-0 bg-gray-300 bg-opacity-15 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg">
                          <textarea
                            placeholder="Answer Here!!"
                            className="w-96 border p-2 rounded"
                            rows={3}
                            name="answer"
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                          ></textarea>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              className="bg-blue-400 text-white px-4 py-1 rounded"
                              onClick={() => handleAnswer(q)}
                            >
                              Save Answer
                            </button>
                            <button
                              className="bg-red-500 text-white px-4 py-1 rounded"
                              onClick={() => setAnsModel(null)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <form onSubmit={fetchQuestion}>
            <div className="mt-6 border rounded-lg p-4 shadow bg-white">
              <h4 className="text-md font-semibold mb-3">Ask</h4>
              <div className="flex gap-3">
                <img
                  src="https://i.pravatar.cc/40?img=2"
                  className="w-10 h-10 rounded-full"
                  alt="avatar"
                />
                <div className="flex-1 space-y-2">
                  <input
                    placeholder="Title"
                    className="w-full border p-2 rounded"
                    name="question_heading"
                    value={questionData.question_heading}
                    onChange={handleChange}
                  />
                  <textarea
                    placeholder="Ask Question?"
                    className="w-full border p-2 rounded"
                    rows={3}
                    name="question_description"
                    value={questionData.question_description}
                    onChange={handleChange}
                  />
                  <div className="text-right">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {selectedTab === "reviews" && (
        <div className="mt-10 text-gray-700 w-full mx-auto space-y-6">
          <ReviewSummary />
          <div className="text-center">
            <p className="text-2xl font-semibold mb-2">
              {userReview ? "Update Your Review" : "Rate this Course"}
            </p>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`cursor-pointer text-2xl ${
                    (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              className="w-full border rounded p-3"
              placeholder="Add a heading for your review..."
              value={reviewHeading}
              onChange={(e) => setReviewHeading(e.target.value)}
            />
            <textarea
              className="w-full border rounded p-3"
              rows={4}
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="text-right">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleReviewSubmit}
            >
              {userReview ? "Update Review" : "Submit Review"}
            </button>
          </div>

          {userReview && (
            <div className="border rounded-lg p-4 shadow bg-gray-50 mt-8">
              <h3 className="text-lg font-semibold mb-2">Your Review</h3>
              <div className="flex items-center mb-2">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-lg ${
                        i < userReview.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{userReview.review_heading}</span>
              </div>
              <p className="text-gray-700">{userReview.review}</p>
              <div className="text-sm text-gray-500 mt-2">
                Posted on {new Date(userReview.created_at).toLocaleDateString()}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">
              All Reviews ({allReviews.length})
            </h3>
            {allReviews
              .filter((review) => !userReview || review.id !== userReview.id)
              .map((review) => (
                <div key={review.id} className="border rounded-lg p-4 shadow bg-gray-50 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-lg ${
                            i < review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{review.review_heading}</span>
                  </div>
                  <p className="text-gray-700">{review.review}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    Posted by {review.user || "Anonymous"} on{" "}
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}