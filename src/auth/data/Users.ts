interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const Users: User[] = [
  {
    id: 0,
    first_name: 'Jhon',
    last_name: 'Doe',
    email: 'example@gmail.com',
    password: '111111',
  },
];

export default Users;
