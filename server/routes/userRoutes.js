import express from "express";
import path from "path";
import { Router } from "express";
import usersData from "../usersDb.json" with {type:"json"};
import directoriesData from "../directoriesDB.json" with {type:"json"};
import { writeFile } from "fs/promises";
const router = express.Router();


router.post('/' , async (req,res,next) =>{
    const{name , email, password} = req.body;
    const dirId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    directoriesData.push( {
        id : dirId, 
        name : `root-${email}`,
        userId,
        parenDirId :null
    })
    console.log('directory:' ,directoriesData);

    usersData.push({
       id :userId,
       name, email,password,
       rootDirId : dirId
    })
    console.log('user:' ,usersData);

    try{
        await writeFile('./directoriesDB.json ', JSON.stringify(directoriesData))
        await writeFile('./usersDB.json ', JSON.stringify(usersData))
        res.status(201).json({message :"user registered successfully!"})
    }catch(err){
    next(err)
    }
})

export default router;