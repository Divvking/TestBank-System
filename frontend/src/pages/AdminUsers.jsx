import { useEffect, useState } from 'react'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers()
      setUsers(res.data)
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await adminApi.deleteUser(id)
      toast.success('User deleted')
      fetchUsers()
    } catch (err) {
      toast.error(err?.response?.data || 'Delete failed')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.userId} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">
                  <span className="px-2 py-1 text-xs rounded bg-gray-200">
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(user.userId)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  )
}