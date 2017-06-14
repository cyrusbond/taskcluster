package whclient

// clientError implements net.Error
type clientError struct {
	errString string
	reconnect bool
	timeout   bool
}

func (c clientError) Error() string {
	return c.errString
}

func (c clientError) Temporary() bool {
	return c.reconnect
}

func (c clientError) Timeout() bool {
	return c.timeout
}

var (
	// ErrRetryTimedOut is returned when Reconnect() time exceeds MaxElapsedTime.
	ErrRetryTimedOut = clientError{timeout: true, errString: "retry timed out"}

	// ErrBadToken is returned when a usable token can not be generated by the authorizer.
	ErrBadToken = clientError{errString: "bad auth token"}

	// ErrRetryFailed is returned when retry attempts fail.
	ErrRetryFailed = clientError{errString: "retry failed"}

	// ErrClientReconnecting is returned when the connection is reconnecting.
	// This is a temporary error.
	ErrClientReconnecting = clientError{errString: "client reconnecting", reconnect: true}

	// ErrClientClosed is returned from an Accept call when the client is closed.
	ErrClientClosed = clientError{errString: "client closed"}

	// ErrAuthorizerNotProvided is returned from New when an Authorizer is not provided.
	ErrAuthorizerNotProvided = clientError{errString: "authorizer function was not provided to client"}

	// ErrTLSConfigRequired is returned when the client attepmts to use a wss:// url without a TLS config
	ErrTLSConfigRequired = clientError{errString: "tls config must be provided to use secure connections"}
)
