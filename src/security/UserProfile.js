import { useParams } from 'react-router-dom';

function UserProfile() {
  let { userId } = useParams();

  // Use the userId to fetch user data, for example
  // ...

  return (
    <div>
      <h2>User Profile</h2>
      <p>User ID: {userId}</p>
    </div>
  );
}
