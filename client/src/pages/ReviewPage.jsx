import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/ReviewPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const buildingNames = {
  clocktower: 'Clock Tower',
  oldgov: 'Old Government House',
  owenglenn: 'Owen G. Glenn Building',
  business: 'Business School',
  library: 'General Library',
  humanities: 'Humanities Building',
  science: 'Science Centre',
  engineering: 'Engineering Building',
}

const mockReviewData = {
  clocktower: [
    {
      id: 1,
      topic: 'History',
      question: 'When was the Clock Tower built?',
      answer: '1926',
      details: 'The Clock Tower was completed in 1926 and is one of the oldest buildings on campus.'
    },
    {
      id: 2,
      topic: 'Architecture',
      question: 'What architectural style does the Clock Tower feature?',
      answer: 'Romanesque Revival',
      details: 'The building showcases Romanesque Revival architecture with its distinctive arches and stonework.'
    },
    {
      id: 3,
      topic: 'Facts',
      question: 'How many bells are in the Clock Tower?',
      answer: '8 bells',
      details: 'The tower houses 8 bells that chime every hour.'
    },
  ],
  oldgov: [
    {
      id: 1,
      topic: 'History',
      question: 'When was Old Government House built?',
      answer: '1850s',
      details: 'Built in the 1850s, it is one of the oldest surviving buildings in Auckland.'
    },
    {
      id: 2,
      topic: 'Architecture',
      question: 'What was the original purpose of this building?',
      answer: 'Government House',
      details: 'It served as the official residence of the Governor of New Zealand.'
    },
  ],
  owenglenn: [
    {
      id: 1,
      topic: 'History',
      question: 'When was Owen G. Glenn Building opened?',
      answer: '2006',
      details: 'The building was officially opened in 2006 and houses the Business School.'
    },
    {
      id: 2,
      topic: 'Facts',
      question: 'How many floors does the building have?',
      answer: '12 floors',
      details: 'The building has 12 floors and is one of the most modern on campus.'
    },
  ],
  business: [
    {
      id: 1,
      topic: 'Programs',
      question: 'What degrees does the Business School offer?',
      answer: 'BCom, MBA, MCom',
      details: 'The school offers undergraduate and postgraduate programs in commerce and business.'
    },
    {
      id: 2,
      topic: 'Accreditation',
      question: 'Which international accreditation does the Business School hold?',
      answer: 'AACSB, EQUIS, AMBA',
      details: 'It is triple-crown accredited, one of only a few schools worldwide.'
    },
  ],
  library: [
    {
      id: 1,
      topic: 'Collections',
      question: 'How many volumes does the General Library hold?',
      answer: 'Over 1 million items',
      details: 'The library houses books, journals, and digital resources.'
    },
    {
      id: 2,
      topic: 'Hours',
      question: 'What are the librarys extended hours during exam period?',
      answer: '24/7 access',
      details: 'During exams, the library offers 24/7 study spaces.'
    },
  ],
  humanities: [
    {
      id: 1,
      topic: 'Departments',
      question: 'Which departments are housed in the Humanities Building?',
      answer: 'Languages, History, Philosophy',
      details: 'The building hosts multiple humanities departments and research centers.'
    },
  ],
  science: [
    {
      id: 1,
      topic: 'Facilities',
      question: 'What specialized facilities are available in the Science Centre?',
      answer: 'Labs, Observatory, Research centers',
      details: 'Features state-of-the-art laboratories and research facilities.'
    },
  ],
  engineering: [
    {
      id: 1,
      topic: 'Programs',
      question: 'What engineering programs are offered?',
      answer: 'Civil, Mechanical, Electrical, Software',
      details: 'The department offers all major branches of engineering.'
    },
  ],
}

function ReviewPage() {
  const navigate = useNavigate()
  const { buildingId } = useParams()
  const { user } = useAuth()
  const [reviewItems, setReviewItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchReviewData()
  }, [buildingId])

  const fetchReviewData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/quizzes/${buildingId}/review`)
      setReviewItems(response.data)
    } catch (err) {
      console.error('Failed to fetch review data:', err)
      const mockData = mockReviewData[buildingId] || [
        { id: 1, topic: 'General', question: 'No review data available for this building yet.', answer: '', details: '' }
      ]
      setReviewItems(mockData)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/quiz/${buildingId}`)
  }

  const handleStartQuiz = () => {
    navigate(`/quiz/${buildingId}/questions`)
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const buildingName = buildingNames[buildingId] || 'Unknown Building'

  if (loading) {
    return (
      <div className="page-container">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo" onClick={handleBack}>UOA Quiz</h2>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading review materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="review-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="navbar-logo" onClick={handleBack}>UOA Quiz</h2>
          <div className="navbar-buttons">
            <button className="btn-nav btn-nav-primary" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </nav>

      <main className="review-content">
        <div className="review-header">
          <h1>📚 {buildingName} Review</h1>
          <p>Review key facts and information before taking the quiz!</p>
        </div>

        {error && (
          <div className="error-message-box">
            ⚠️ {error}
          </div>
        )}

        <div className="review-list">
          {reviewItems.map((item) => (
            <div 
              key={item.id} 
              className={`review-card ${expandedId === item.id ? 'expanded' : ''}`}
            >
              <div className="review-card-header" onClick={() => toggleExpand(item.id)}>
                <div className="review-topic-badge">{item.topic}</div>
                <div className="review-question">{item.question}</div>
                <div className="expand-icon">
                  {expandedId === item.id ? '−' : '+'}
                </div>
              </div>
              
              {expandedId === item.id && (
                <div className="review-card-body">
                  <div className="review-answer">
                    <span className="answer-label">Answer:</span>
                    <span className="answer-text">{item.answer}</span>
                  </div>
                  {item.details && (
                    <div className="review-details">
                      <span className="details-label">Details:</span>
                      <p>{item.details}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="review-actions">
          <button className="btn btn-secondary" onClick={handleBack}>
            Back to Building
          </button>
          <button className="btn btn-primary" onClick={handleStartQuiz}>
            Ready for Quiz
          </button>
        </div>
      </main>
    </div>
  )
}

export default ReviewPage