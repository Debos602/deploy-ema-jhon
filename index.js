const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middlewar
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s1jwce7.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const productCollection = client.db("emaJhon").collection("products");

		app.get("/products", async (req, res) => {
			const page = parseInt(req.query.page);
			const size = parseInt(req.query.size);
			console.log(page, size);
			const query = {};
			const cursor = productCollection.find(query);
			const products = await cursor
				.skip(page * size)
				.limit(size)
				.toArray();
			const count = await productCollection.estimatedDocumentCount();
			// console.log({ count, products });

			res.send({ count, products });
		});

		app.post("/productsGetsByIds", async (req, res) => {
			try {
				const ids = req.body;

				if (!Array.isArray(ids)) {
					return res
						.status(400)
						.send("Invalid input format. Expected an array of IDs.");
				}

				// Validate IDs (you can enhance this validation further)
				const validIds = ids.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

				console.log("Valid IDs:", validIds);

				const objectsId = validIds.map((id) => new ObjectId(id));
				const query = { _id: { $in: objectsId } };
				const cursor = productCollection.find(query);
				const products = await cursor.toArray();
				res.send(products);
			} catch (error) {
				console.error("Error:", error);
				res.status(500).send("Internal Server Error");
			}
		});
	} finally {
	}
}
run().catch((err) => console.error(err));
app.get("/", (req, res) => {
	res.send("ema john server is running");
});

app.listen(port, () => {
	console.log(`ema john running on: ${port}`);
});
