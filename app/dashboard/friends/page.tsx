import { createClient } from '@/lib/supabase/server'
import AddFriendButton from '@/components/friends/AddFriendButton'
import FriendCard from '@/components/friends/FriendCard'
import { ChevronRight, Bell, TrendingUp, TrendingDown, UserPlus } from 'lucide-react'

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8">Please log in to view your friends.</div>
  }

  // Fetch friendships with profiles
  const { data: friendships } = await supabase
    .from('friendships')
    .select('*, requester:profiles!friendships_requester_id_fkey(*), addressee:profiles!friendships_addressee_id_fkey(*)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Separate pending requests and accepted friends
  const pendingRequests = friendships?.filter(
    (fs) => fs.status === 'pending' && fs.addressee_id === user.id
  ) || []

  const acceptedFriends = friendships?.filter((fs) => fs.status === 'accepted') || []

  // Calculate balances per friend from loans
  const { data: loans } = await supabase
    .from('loans')
    .select('*')
    .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
    .neq('status', 'repaid')

  // Build balance map
  const balanceMap: Record<string, number> = {}
  loans?.forEach((loan) => {
    const remaining = Number(loan.remaining_amount || loan.amount)
    if (loan.lender_id === user.id) {
      // I lent money - they owe me
      const friendId = loan.borrower_id
      balanceMap[friendId] = (balanceMap[friendId] || 0) + remaining
    } else {
      // I borrowed - I owe them
      const friendId = loan.lender_id
      balanceMap[friendId] = (balanceMap[friendId] || 0) - remaining
    }
  })

  // Calculate totals
  let totalOwedToMe = 0
  let totalIOwe = 0
  Object.values(balanceMap).forEach((balance) => {
    if (balance > 0) totalOwedToMe += balance
    else totalIOwe += Math.abs(balance)
  })

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-surface-light border-b border-border-light flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
        <div className="flex items-center text-sm text-gray-500">
          <span>Social</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-text-main font-medium">My Network</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-background-light transition-colors">
            <Bell className="w-5 h-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
          {/* Page Heading & Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-2">My Network</h1>
              <p className="text-text-secondary">Manage your social connections and track shared expenses.</p>
            </div>
            <AddFriendButton />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-light p-6 rounded-xl border border-border-light shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Owed to You</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main">PKR {totalOwedToMe.toLocaleString()}</h3>
                  {totalOwedToMe > 0 && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Receivable
                    </span>
                  )}
                </div>
              </div>
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-surface-light p-6 rounded-xl border border-border-light shadow-sm flex items-center justify-between group hover:border-red-400/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total You Owe</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main">PKR {totalIOwe.toLocaleString()}</h3>
                  {totalIOwe > 0 && (
                    <span className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                      Payable
                    </span>
                  )}
                </div>
              </div>
              <div className="size-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Main List Section */}
          <div className="bg-surface-light rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-border-light text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Balance</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-border-light">
              {/* Pending Requests */}
              {pendingRequests.map((fs) => (
                <FriendCard
                  key={fs.id}
                  friendship={fs}
                  currentUserId={user.id}
                  balance={0}
                  isPending={true}
                />
              ))}

              {/* Accepted Friends */}
              {acceptedFriends.map((fs) => {
                const friend = fs.requester_id === user.id ? fs.addressee : fs.requester
                const balance = balanceMap[friend.id] || 0
                return (
                  <FriendCard
                    key={fs.id}
                    friendship={fs}
                    currentUserId={user.id}
                    balance={balance}
                    isPending={false}
                  />
                )
              })}

              {/* Empty State */}
              {friendships?.length === 0 && (
                <div className="py-12 text-center">
                  <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-1">No friends yet</h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto">
                    Add friends to start tracking shared expenses and managing social loans.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Empty State Hint */}
          {acceptedFriends.length > 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-1">Grow your network</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                Add more friends to start tracking shared expenses, splitting bills, and managing loans seamlessly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
