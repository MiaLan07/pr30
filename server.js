const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer')
const path = require('path')
const app = express();
const port = 5000;
app.use(express.json());
const sequelize = require('./database')
const { User, Item } = require('./models')
const JWT_SECRET = 'Stolar';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage })

sequelize.sync();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password and email are required' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required'
        });
        }
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'User logged in successfully', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

app.post('/items', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { brand, model, price } = req.body;
        const imagePath = req.file.path;
        const item = await Item.create({ brand, model, price, imagePath });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/items', requireAuth, async (req, res) => {
    try {
        const items = await Item.findAll();
        res.status(200).json(items);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});
app.get('/items/:id', requireAuth, async (req, res) => {
    try {
        const item = Item.findByPk(req.params.id)
        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});
app.put('/items/:id', requireAuth, async (req, res) => {
	try {
		const item = await Item.findByPk(req.params.id)
		if (item) {
			await item.update(req.body)
			res.json(item)
		} else {
			res.status(404).json({ error: 'Item not found' })
		}
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
});
app.delete('/items/:id', requireAuth, async (req, res) => {
	try {
		const item = await Item.findByPk(req.params.id)
		if (item) {
			await item.destroy()
			res.status(204).end()
		} else {
			res.status(404).json({ error: 'Item not found' })
		}
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
});

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'This is the API documentation for the project.',
        },
    },
    apis: ['./swagger.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));   
