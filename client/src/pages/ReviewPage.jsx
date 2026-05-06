import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import '../styles/Pages.css'
import '../styles/ReviewPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const buildingNames = {
  clocktower: 'Clock Tower',
  oggb: 'Owen G. Glenn Building',
  'general-library': 'General Library',
  'arts-education': 'Faculty of Arts and Education',
  science: 'Science Centre',
  engineering: 'Engineering Building',
  'law-school': 'Auckland Law School',
}

const mockReviewData = {
  'general-library': [
    {
      id: 'library-overview',
      topic: 'Overview',
      question: 'General Library',
      answer: 'General Library',
      details: 'No review data available from the backend yet.',
      imageUrls: [],
    },
  ],
}

function ReviewPage() {
  const navigate = useNavigate()
  const { buildingId } = useParams()
  const [reviewItems, setReviewItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryIndex, setGalleryIndex] = useState(0)

  const fetchReviewData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/quizzes/${buildingId}/review`)
      setReviewItems(response.data)
    } catch (err) {
      console.error('Failed to fetch review data:', err)
      setError('Could not load review data from the backend.')
      const mockData = mockReviewData[buildingId] || [
        {
          id: 'empty-review',
          topic: 'General',
          question: 'No review data available for this building yet.',
          answer: '',
          details: '',
          imageUrls: [],
        },
      ]
      setReviewItems(mockData)
    } finally {
      setLoading(false)
    }
  }, [buildingId])

  useEffect(() => {
    // The review data comes from the backend whenever the selected building changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviewData()
  }, [fetchReviewData])

  const handleBack = () => {
    navigate(`/quiz/${buildingId}`)
  }

  const handleStartQuiz = () => {
    navigate(`/quiz/${buildingId}/questions`)
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return ''
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    return `${API_URL}${imageUrl}`
  }

  const openGallery = (imageUrls, index = 0) => {
    setGalleryImages(imageUrls)
    setGalleryIndex(index)
  }

  const closeGallery = () => {
    setGalleryImages([])
    setGalleryIndex(0)
  }

  const showPreviousImage = () => {
    setGalleryIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    )
  }

  const showNextImage = () => {
    setGalleryIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    )
  }

  const buildingName = buildingNames[buildingId] || 'Unknown Building'

  if (loading) {
    return (
      <div className="page-container">
        <nav className="navbar">
          <div className="navbar-container">
            <h2 className="navbar-logo" onClick={handleBack}>
              UOA Quiz
            </h2>
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
          <h2 className="navbar-logo" onClick={handleBack}>
            UOA Quiz
          </h2>
          <div className="navbar-buttons">
            <button className="btn-nav btn-nav-primary" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </nav>

      <main className="review-content">
        <div className="review-header">
          <h1>{buildingName} Review</h1>
          <p>Review key facts and information before taking the quiz.</p>
        </div>

        {error && <div className="error-message-box">{error}</div>}

        <div className="review-list">
          {reviewItems.map((item) => {
            const imageUrls = item.imageUrls || []

            return (
              <div
                key={item.id}
                className={`review-card ${expandedId === item.id ? 'expanded' : ''}`}
              >
                <button
                  className="review-card-header"
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                >
                  <span className="review-topic-badge">{item.topic}</span>
                  <span className="review-question">{item.question}</span>
                  <span className="expand-icon">
                    {expandedId === item.id ? '-' : '+'}
                  </span>
                </button>

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

                    {imageUrls.length > 0 && (
                      <div className="review-gallery-preview">
                        <button
                          className="review-image-button"
                          type="button"
                          onClick={() => openGallery(imageUrls)}
                        >
                          View building photos
                        </button>
                        <div className="review-thumbnail-row">
                          {imageUrls.slice(0, 3).map((imageUrl, index) => (
                            <button
                              className="review-thumbnail-button"
                              type="button"
                              key={imageUrl}
                              onClick={() => openGallery(imageUrls, index)}
                            >
                              <img
                                src={resolveImageUrl(imageUrl)}
                                alt={`${buildingName} ${index + 1}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
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

      {galleryImages.length > 0 && (
        <div
          className="review-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${buildingName} photos`}
        >
          <div className="review-gallery-backdrop" onClick={closeGallery}></div>
          <div className="review-gallery-panel">
            <button
              className="review-gallery-close"
              type="button"
              onClick={closeGallery}
              aria-label="Close gallery"
            >
              x
            </button>
            <img
              className="review-gallery-image"
              src={resolveImageUrl(galleryImages[galleryIndex])}
              alt={`${buildingName} photo ${galleryIndex + 1}`}
            />
            <div className="review-gallery-controls">
              <button type="button" onClick={showPreviousImage}>
                Previous
              </button>
              <span>
                {galleryIndex + 1} / {galleryImages.length}
              </span>
              <button type="button" onClick={showNextImage}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewPage
