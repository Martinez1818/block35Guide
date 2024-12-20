const {
  client,
  createTables,
  createUser,
  createSkill,
  createUserSkill,
  fetchUsers,
  fetchSkills,
  fetchUserSkills,
  deleteUserSkill,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

//GET /api/skills
app.get("/api/skills", async (req, res, next) => {
  try {
    res.send(await fetchSkills());
  } catch (ex) {
    next(ex);
  }
});

//GET /api/users
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

//GET /api/users/:id/userSkills
app.get("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.send(await fetchUserSkills(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

//DELETE /api/users/:userId/userSkills/:id
app.delete("/api/users/:userId/userSkills/:id", async (req, res, next) => {
  try {
    await deleteUserSkill({ id: req.params.id, user_id: req.params.userId });

    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

//POST /api/users/:id/userSkills
app.post("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.status(201).send(await createUserSkill({ user_id: req.params.id, skill_id: req.body.skill_id}));
  } catch (ex) {
    next(ex);
  }
});

//ERROR Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});

//INIT FUNCTION
const init = async () => {
  try {
    await client.connect();
    console.log("Connected to database");

    await createTables();
    console.log("Tables created");

    let moe, lucy, larry, ethyl, dancing, singing, plateSpinning, juggling;

    try {
      [moe, lucy, larry, ethyl, dancing, singing, plateSpinning, juggling] = await Promise.all([
        createUser({ username: "moe", password: "moe_pw" }),
        createUser({ username: "lucy", password: "lucy_pw" }),
        createUser({ username: "larry", password: "larry_pw" }),
        createUser({ username: "ethyl", password: "ethyl_pw" }),
        createSkill({ name: "dancing" }),
        createSkill({ name: "singing" }),
        createSkill({ name: "plate spinning" }),
        createSkill({ name: "juggling" }),
      ]);
    } catch (err) {
      console.error("Error creating users or skills:", err.message);
      process.exit(1);
    }

    console.log("Users created:", await fetchUsers());
    console.log("Skills created:", await fetchSkills());

    try {
      const userSkills = await Promise.all([
        createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id }),
        createUserSkill({ user_id: moe.id, skill_id: dancing.id }),
        createUserSkill({ user_id: ethyl.id, skill_id: singing.id }),
        createUserSkill({ user_id: ethyl.id, skill_id: juggling.id }),
      ]);

      console.log("User Skills created:", userSkills);
      console.log("User Skills for Moe:", await fetchUserSkills(moe.id));
    } catch (err) {
      console.error("Error creating user skills:", err.message);
    }

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (err) {
    console.error("Error during init", err.message);
    process.exit(1); 
  }
};

init();