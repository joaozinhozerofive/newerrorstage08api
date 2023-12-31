const AppError = require("../utils/AppError")
const { hash } = require("bcryptjs")
const sqliteConnection = require("../database/sqlite/index");
const { request } = require("express");

class UsersController {

  
    async create(request, response) {
      const { name, email, password } = request.body;
  
      const database = await sqliteConnection();
      const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])
  
      if (checkUserExists) {
        throw new AppError("Este e-mail já está em uso.");
      }

      const  hashedPassword = await hash(password, 8)
  
      await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword])
  
      return response.status(201).json();
    }
        async update (request, response){
            const { name, email } = request.body;

            const {id} = request.params

            const database = await sqliteConnection()

            const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

            if (!user) {
                throw new AppError ("Usuário não encontrado")
            }

            const userWhithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

            if(!userWhithUpdatedEmail && userWhithUpdatedEmail.id !== id){
                throw new AppError("Este e-mail já está em uso")
            }

            user.name = name;
            user.email = email;

            await database.run(`
            UPDATE users SET
            name = ?.
            email= ?,
            updated_at = ?
            WHERE id = ?`, 

            [user.name, user.email, new Date(),  id]
            ); 

            return  response.status(200).json();
        }

}
    


module.exports = UsersController;