import express from "express";

const app = express();

app.set('views', 'views');
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render('index');
});
const PORT = 3000;

app.listen(PORT, ()=> console.log(`Server running on http://localhost:3000/`));