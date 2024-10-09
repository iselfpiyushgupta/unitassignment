const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb+srv://bwinpiyush:Realpiyush1@cluster0.5mbfzxj.mongodb.net/auth-db?retryWrites=true&w=majority&appName=Cluster0'
    }
}


exports.get = function get(env){
    return config[env] || config.default
}