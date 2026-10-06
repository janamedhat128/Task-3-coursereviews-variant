import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Load existing review data when editing (id is present)
  useEffect(() => {
    if (!id) return
    api.get(`/reviews/${id}`)
      .then(res => {
        console.log('API Response Data:', res.data) // Check F12 Console to see exact structure!
        
        // Handle potential nesting (e.g. res.data.review or res.data)
        const review = res.data.review || res.data || {}
        
        setForm({
          courseCode: review.courseCode || '',
          rating: review.rating || 5,
          comment: review.comment || ''
        })
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load review')
      })
  }, [id])

  // Update form state on change, ensuring rating is saved as a number
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }

  // Handle form submission for creation (POST) or editing (PATCH)
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/reviews/${id}`, form)
      } else {
        await api.post('/reviews', form)
      }
      nav('/reviews')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Course Code Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Course Code</label>
          <input
            type="text"
            name="courseCode"
            value={form.courseCode}
            onChange={onChange}
            required
            placeholder="e.g. CS101"
            className="w-full border rounded p-2"
          />
        </div>

        {/* Rating Select (1-5) */}
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <select
            name="rating"
            value={form.rating}
            onChange={onChange}
            className="w-full border rounded p-2"
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </select>
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="block text-sm font-medium mb-1">Comment (Optional)</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={onChange}
            rows="3"
            placeholder="Write your review here..."
            className="w-full border rounded p-2"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}