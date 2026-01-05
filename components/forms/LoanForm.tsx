'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ArrowDownLeft, ArrowUpRight, ArrowLeft, Handshake, User, Check, Search, Clock } from 'lucide-react'

interface LoanFormProps {
  onSuccess: () => void
  onCancel: () => void
}

type LoanDirection = 'took' | 'gave' | null
type Step = 'direction' | 'person' | 'details'

interface Friend {
  id: string
  username: string
  real_name: string | null
}

interface Profile {
  id: string
  username: string
  real_name: string | null
}

export default function LoanForm({ onSuccess, onCancel }: LoanFormProps) {
  const [step, setStep] = useState<Step>('direction')
  const [direction, setDirection] = useState<LoanDirection>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [personName, setPersonName] = useState('')
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [recentContacts, setRecentContacts] = useState<Profile[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    loanDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadFriends()
    loadRecentContacts()
  }, [])

  // Load recent contacts from recent loans/transactions
  const loadRecentContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get recent loan contacts
    const { data: loans } = await supabase
      .from('loans')
      .select('lender_id, borrower_id, lender:profiles!loans_lender_id_fkey(*), borrower:profiles!loans_borrower_id_fkey(*)')
      .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (loans) {
      const contacts = new Map<string, Profile>()
      loans.forEach((loan: any) => {
        if (loan.lender_id !== user.id && loan.lender) {
          contacts.set(loan.lender_id, loan.lender)
        }
        if (loan.borrower_id !== user.id && loan.borrower) {
          contacts.set(loan.borrower_id, loan.borrower)
        }
      })
      setRecentContacts(Array.from(contacts.values()).slice(0, 5))
    }
  }

  // Search profiles with debouncing
  const searchProfiles = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setSearching(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSearching(false)
        return
      }

      // Search profiles by username or real_name
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, real_name')
        .neq('id', user.id)
        .or(`username.ilike.%${searchTerm}%,real_name.ilike.%${searchTerm}%`)
        .limit(5)

      if (!error && profiles) {
        // Filter out already-added friends (we'll show them separately)
        const friendIds = new Set(friends.map(f => f.id))
        const nonFriendProfiles = profiles.filter(p => !friendIds.has(p.id))
        setSuggestions(nonFriendProfiles)
      }
      setSearching(false)
    },
    [friends, supabase]
  )

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (personName.trim()) {
        searchProfiles(personName.trim())
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [personName, searchProfiles])

  const loadFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('friendships')
      .select('*, friend:profiles!friendships_addressee_id_fkey(*), requester:profiles!friendships_requester_id_fkey(*)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (data) {
      const friendList = data.map((fs: any) => {
        const friend = fs.requester_id === user.id ? fs.friend : fs.requester
        return { id: friend.id, username: friend.username, real_name: friend.real_name }
      }).filter(Boolean) as Friend[]
      setFriends(friendList)
    }
  }

  const handleDirectionSelect = (dir: LoanDirection) => {
    setDirection(dir)
    setStep('person')
  }

  const handleSelectProfile = async (profile: Profile) => {
    setPersonName(profile.real_name || profile.username)
    setShowSuggestions(false)
    setError(null)

    // Check if it's a friend
    const isFriend = friends.find(f => f.id === profile.id)
    if (isFriend) {
      setSelectedFriend(isFriend)
    } else {
      // Auto-send friend request for fast operations
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if request already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`)
        .single()

      if (!existing) {
        // Send friend request
        await supabase.from('friendships').insert({
          requester_id: user.id,
          addressee_id: profile.id,
          status: 'pending',
        })
      }

      // Use the profile anyway (they can accept later)
      setSelectedFriend({ id: profile.id, username: profile.username, real_name: profile.real_name })
    }
  }

  const handleContinue = () => {
    if (!personName.trim()) {
      setError('Please enter a name')
      return
    }
    setShowSuggestions(false)
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!direction || !personName.trim()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const amount = parseFloat(formData.amount)
    const loanDate = new Date(formData.loanDate)
    
    if (new Date(formData.dueDate) <= loanDate) {
      setError('Due date must be after loan date')
      setLoading(false)
      return
    }

    const lenderId = direction === 'took' 
      ? (selectedFriend?.id || user.id) 
      : user.id
    const borrowerId = direction === 'took' 
      ? user.id 
      : (selectedFriend?.id || user.id)

    const loanNotes = selectedFriend 
      ? formData.notes 
      : `${direction === 'took' ? 'From' : 'To'}: ${personName}${formData.notes ? ` - ${formData.notes}` : ''}`

    const { data: loanData, error: loanError } = await supabase.from('loans').insert({
      lender_id: lenderId,
      borrower_id: borrowerId,
      amount,
      remaining_amount: amount,
      due_date: formData.dueDate,
      notes: loanNotes,
      status: 'active',
    }).select().single()

    if (loanError) {
      console.error('Loan error:', loanError)
      setError(loanError.message)
      setLoading(false)
      return
    }

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: direction === 'took' ? 'loan_received' : 'loan_given',
      amount,
      description: `Loan ${direction === 'took' ? 'from' : 'to'} ${personName}`,
      category: 'loan',
      date: formData.loanDate,
      month: loanDate.getMonth() + 1,
      year: loanDate.getFullYear(),
      loan_id: loanData?.id || null,
    })

    if (txError) {
      console.error('Transaction error:', txError)
      setError(txError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Step 1: Direction Selection
  if (step === 'direction') {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-text-secondary text-sm text-center">Select loan direction</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleDirectionSelect('took')}
            className="group relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-primary hover:shadow-md hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-primary group-hover:scale-110 transition-transform duration-300">
              <ArrowDownLeft className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-text-main">I took a loan</h3>
              <p className="text-sm text-gray-500 mt-1">Someone lent me money</p>
            </div>
          </button>

          <button
            onClick={() => handleDirectionSelect('gave')}
            className="group relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-primary hover:shadow-md hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-expense group-hover:scale-110 transition-transform duration-300">
              <ArrowUpRight className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-text-main">I gave a loan</h3>
              <p className="text-sm text-gray-500 mt-1">I lent money to someone</p>
            </div>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full px-8 py-3 rounded-lg border border-transparent text-text-main font-bold hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Step 2: Person Selection with suggestions
  if (step === 'person') {
    const displaySuggestions = showSuggestions && personName.trim().length >= 2
    const hasResults = (friends.length > 0 || recentContacts.length > 0 || suggestions.length > 0) && !displaySuggestions

    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => setStep('direction')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <p className="text-text-secondary text-sm">
          Who did you {direction === 'took' ? 'borrow from' : 'lend to'}?
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex flex-col gap-2">
          <label className="text-sm font-medium text-text-main" htmlFor="personName">
            Search by name or username
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="personName"
              type="text"
              placeholder="Type to search (e.g., Ahmed, @username)"
              value={personName}
              onChange={(e) => {
                setPersonName(e.target.value)
                setError(null)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-input-border focus:border-primary focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {displaySuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-64 overflow-y-auto">
              {/* Recent Contacts */}
              {recentContacts.length > 0 && !personName.trim() && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    Recent
                  </div>
                  {recentContacts.map((contact) => {
                    const isFriend = friends.find(f => f.id === contact.id)
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleSelectProfile(contact)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                          {(contact.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-main truncate">
                            {contact.real_name || contact.username}
                          </p>
                          <p className="text-xs text-text-secondary truncate">
                            @{contact.username} {isFriend ? '• Friend' : '• Platform user'}
                          </p>
                        </div>
                        {isFriend && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Friends */}
              {friends.length > 0 && personName.trim().length < 2 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                    <Check className="w-3.5 h-3.5" />
                    Friends
                  </div>
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => handleSelectProfile(friend)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {(friend.username || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main truncate">
                          {friend.real_name || friend.username}
                        </p>
                        <p className="text-xs text-text-secondary truncate">@{friend.username}</p>
                      </div>
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {suggestions.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                    <Search className="w-3.5 h-3.5" />
                    Search Results
                  </div>
                  {suggestions.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleSelectProfile(profile)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                        {(profile.username || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main truncate">
                          {profile.real_name || profile.username}
                        </p>
                        <p className="text-xs text-text-secondary truncate">@{profile.username} • Will send friend request</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {personName.trim().length >= 2 && suggestions.length === 0 && !searching && (
                <div className="p-6 text-center">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No results found</p>
                  <p className="text-xs text-gray-400 mt-1">They can be added as a custom contact</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Person Preview */}
        {selectedFriend && !displaySuggestions && (
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
              {(selectedFriend.username || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-main">
                {selectedFriend.real_name || selectedFriend.username}
              </p>
              <p className="text-xs text-text-secondary">
                @{selectedFriend.username} • {friends.find(f => f.id === selectedFriend.id) ? 'Friend' : 'Friend request sent'}
              </p>
            </div>
            <Check className="w-5 h-5 text-primary" />
          </div>
        )}

        {/* Manual Entry Option */}
        {!selectedFriend && personName.trim() && !displaySuggestions && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-main">{personName}</p>
              <p className="text-xs text-text-secondary">Will be added as a custom contact</p>
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!personName.trim()}
          className="w-full py-3 px-4 rounded-lg bg-primary text-text-main font-bold hover:brightness-95 disabled:opacity-50 transition-all"
        >
          Continue
        </button>

        <button
          onClick={onCancel}
          className="w-full px-8 py-3 rounded-lg border border-transparent text-text-main font-bold hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Step 3: Loan Details (unchanged)
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setStep('person')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Selected Person */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${
          selectedFriend ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'
        }`}>
          {personName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-text-main">{personName}</p>
          <p className="text-xs text-text-secondary">
            {direction === 'took' ? 'Borrowing from' : 'Lending to'} {selectedFriend ? `@${selectedFriend.username}` : 'this person'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Amount Field */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-bold uppercase tracking-wider" htmlFor="amount">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main text-2xl font-bold">PKR</span>
          <input
            autoFocus
            className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-16 pl-16 pr-4 text-3xl font-bold"
            id="amount"
            name="amount"
            placeholder="0"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Loan Date and Due Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium" htmlFor="loanDate">
            When did you {direction === 'took' ? 'take' : 'give'} this loan?
          </label>
          <input
            className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-14 px-4 text-base font-medium"
            id="loanDate"
            name="loanDate"
            type="date"
            value={formData.loanDate}
            onChange={handleChange}
            max={format(new Date(), 'yyyy-MM-dd')}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-medium" htmlFor="dueDate">
            When {direction === 'took' ? 'will you repay' : 'will they repay'} it?
          </label>
          <input
            className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-14 px-4 text-base font-medium"
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            min={formData.loanDate}
            required
          />
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-text-main text-sm font-medium" htmlFor="notes">
          Notes (Optional)
        </label>
        <textarea
          className="w-full rounded-lg border border-input-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 p-4 text-base resize-none"
          id="notes"
          name="notes"
          placeholder="What is this loan for?"
          rows={2}
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-4 mt-4 pt-4 border-t border-dashed border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-auto px-8 py-3 rounded-lg border border-transparent text-text-main font-bold hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:flex-1 py-3 px-8 rounded-lg bg-primary text-text-main font-bold text-base hover:brightness-105 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Handshake className="w-5 h-5" />
          {loading ? 'Creating...' : 'Create Loan'}
        </button>
      </div>
    </form>
  )
}
