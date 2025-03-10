const Sequelize = require('./database.js')
const { DataTypes, DATE } = require('sequelize')
const User = Sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Item = Sequelize.define('Item', {
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imagePath: {
        type: DataTypes.STRING,
    }
});
module.exports = { User, Item }