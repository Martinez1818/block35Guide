const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_talent_agency_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const createTables = async ()=> {
    const SQL = `
        DROP TABLE IF EXISTS user_skills;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS skills;
        CREATE TABLE users(
            id uuid PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255)
        );
        CREATE TABLE skills(
            id uuid PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        );
        CREATE TABLE user_skills( 
            id uuid PRIMARY KEY,
            skill_id uuid REFERENCES skills(id) NOT NULL,
            user_id uuid REFERENCES users(id) NOT NULL,
            CONSTRAINT unique_skill_user UNIQUE (skill_id, user_id)
        );
    `;
    await client.query(SQL);
};

const createUser = async({ username, password}) => {
    const SQL = `
        INSERT INTO users(id, username, password) VALUES($1, $2, $3)
        RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
}

const createSkill = async({ name }) => {
    const SQL = `
        INSERT INTO skills(id, name) VALUES($1, $2)
        RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
}

const createUserSkill = async ({ user_id, skill_id }) => {
    const SQL = `
        INSERT INTO user_skills(id, user_id, skill_id)
        VALUES($1, $2, $3)
        RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, skill_id]);
    return response.rows[0];
}
const fetchUsers = async() => {
    const SQL = `
        SELECT id, username
        FROM users
    `;
    const response = await client.query(SQL);
    return response.rows;
}

const fetchSkills = async() => {
    const SQL = `
        SELECT * 
        FROM skills;
    `;
    const response = await client.query(SQL);
    return response.rows;
}

const fetchUserSkills = async(user_id) => {
    const SQL = `
        SELECT * 
        FROM user_skills
        WHERE user_id = $1;
    `;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
}

const deleteUserSkill = async(user_id, id) => { 
    const SQL = `
        DELETE 
        FROM user_skills
        WHERE user_id = $1 AND user_id = $2;
    `;
    await client.query(SQL, [user_id, id]);
}

module.exports = {
    client,
    createTables,
    createUser,
    createSkill,
    fetchUsers,
    fetchSkills,
    fetchUserSkills,
    createUserSkill,
    deleteUserSkill
};