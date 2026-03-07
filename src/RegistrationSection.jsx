function RegistrationSection({
  users,
  selectedUser,
  setSelectedUser,
  actionType,
  setActionType,
  handleApprove,
  handleReject,
  handleEdit
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Registration Management</h2>

      {users.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 text-lg">No registrations found for this event.</p>
          <p className="text-gray-500 text-sm mt-2">Users need to register for this specific event to appear here.</p>
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-lg shadow mb-4"
          >
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Event:</b> {user.event}</p>
            <p><b>Phone Number:</b> {user.phone_number || "Not provided"}</p>
            <p><b>Emergency Contact:</b> {user.emergency_number || "Not provided"}</p>
            <p><b>Registration Type:</b> {user.role || "N/A"}</p>

            <p>
              <b>Status:</b>{" "}
              <span
                className={
                  user.status === "approved"
                    ? "text-green-600 font-semibold"
                    : user.status === "rejected"
                    ? "text-red-600 font-semibold"
                    : "text-yellow-600 font-semibold"
                }
              >
                {user.status}
              </span>
            </p>

            {user.status === "approved" && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setActionType("edit");
                  }}
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                  Edit
                </button>
              </div>
            )}

            {user.status === "pending" && (
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setActionType("approve");
                  }}
                  className="bg-green-500 text-white px-4 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setActionType("reject");
                  }}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {selectedUser && actionType === "edit" && (
        <EditModal
          user={selectedUser}
          onSubmit={handleEdit}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedUser && actionType === "approve" && (
        <ApproveModal
          user={selectedUser}
          onSubmit={handleApprove}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedUser && actionType === "reject" && (
        <RejectModal
          onSubmit={handleReject}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}