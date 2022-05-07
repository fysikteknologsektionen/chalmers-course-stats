db.createUser({
  user: "stats",
  pwd: "password",
  roles: [
    {
      role: "readWrite",
      db: "stats",
    },
  ],
});
