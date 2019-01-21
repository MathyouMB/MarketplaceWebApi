//require express
const express = require('express');
const app = express();

//Store 
let store = {
    products:[
        {"id":0,"title":"Product 0", "price":3.99, "inventory_count":10}, 
        {"id":1,"title":"Product 1", "price":2.99, "inventory_count":-10}, 
        {"id":2,"title":"Product 2", "price":1.99, "inventory_count":10}
      ]
};

//The Cart
let cart = {};


app.get("/", (req, res) =>{
    res.send("Welcome to the marketplace!")
});

app.get("/api", (req, res) =>{
    res.send("Welcome to the marketplace api!")
});

//GET request all products
app.get("/api/products", (req, res) =>{
    console.log("Fetching all products...")
    res.json(store.products);
});

//GET request all available products
app.get("/api/products/available", (req, res) =>{
    
    let toReturn = []; //the list of products that will be returned in the response
  
    for (let i in store.products) {
        if (store.products[i].inventory_count >= 0){ //if the product is in stock...
            toReturn.push(store.products[i]);//add it to the return list
        }
    }
    console.log("Fetching all available products...")
    res.json(toReturn);
});

//GET request products by id
app.get("/api/products/:id", (req, res) =>{
    
    let toReturn; //the product to be returned in the response


    for (let i in store.products) {
        if (store.products[i].id == req.params.id){
            toReturn = store.products[i];
        }
    }

    if (toReturn != null){// if the product is a real product
        console.log("Fetching product " +req.params.id+"...")
        res.json(toReturn);
    }else{
        console.log("ERROR: Invalid ID, cannot fetch product.")
        res.send("ERROR: Invalid ID, cannot fetch product.")
    }
    
});

//POST request to purchase a product
app.post("/api/products/:id", (req, res) =>{
    
    let id = req.params.id; //holds current product id
    
    if (store.products[id] != null){ // if the product is a real product
        if(store.products[id].inventory_count > 0){ // if the product is in stock
            store.products[id].inventory_count -=1; //purchase product
            console.log("Purchased "+store.products[id].title+"...it cost "+store.products[id].price);
            res.send("Purchased "+store.products[id].title+"...it cost "+store.products[id].price);
        }else{ // if the product is not in stock, throw an error
            console.log("ERROR: Not in stock, cannot purchase product.");
            res.send("ERROR: Not in stock, cannot purchase product.");
        }
    }else{ // if the product does not exist
        console.log("ERROR: Invalid ID, cannot purchase product.");
        res.send("ERROR: Invalid ID, cannot purchase product.");
    }
    
});

//GET request whats in your cart
app.get("/api/cart", (req, res) =>{
    
    if (cart.products == null){ // if you have no products
        console.log("ERROR: You haven't created a cart.");
        console.log("Make a POST request to /api/cart to create a cart.")
        res.send("ERROR: You haven't created a cart.");
    }else{ // if you do have products in your cart.. 
        console.log("Displaying cart...");
        res.json(cart);
    }
    
    
});

//GET request that gives the total cost of whats in your cart
app.get("/api/cart/cost", (req, res) =>{
    
    if (cart.products == null){ //if the cart doesnt exist
        console.log("ERROR: You haven't created a cart.")
        console.log("make a POST request to /api/cart to create a cart.")
        res.send("ERROR: You haven't created a cart.");
    }else if(cart.products != []){// if there are products in the cart
        let cost = 0;
        for (let i in cart.products) {
            cost += (cart.products[i].price*cart.products[i].inventory_count)
        }
        console.log("$"+cost);
        res.send("$"+cost);
    }else{
        console.log("$"+0);
        res.send("$"+0);
    }
    
    
});

//POST request to create a blank cart
app.post("/api/cart", (req, res) =>{
    if (cart.products == null){
        cart.products = []
        console.log("Created Blank Cart...");
        res.send("Created Blank Cart...");
    }else{
        console.log("ERROR: You already have a Cart.")
        res.send("ERROR: You already have a Cart..");
    }
    
});

//POST request to buy the items in your cart
app.post("/api/cart/complete", (req, res) =>{
    
    validPurchase = true; //if there is an error this will turn false

    if (cart.products == null){ //if the cart doesnt exist
        console.log("ERROR: You haven't created a cart.")
        console.log("make a POST request to /api/cart to create a cart.")
        res.send("ERROR: You haven't created a cart.");
  
    }else if(cart.products != []){// if there are products in the cart
        for (let i in cart.products) { //for every product in the cart
           
            let goodId = 0;

            for (let j in store.products){
                if(store.products[j].id == cart.products[i].id){
                    goodId = j;
                }
            }

            if((store.products[goodId].inventory_count -= cart.products[i].inventory_count) >=0){   //if there are enough of the specified product available
                console.log("Purchased "+cart.products[i].inventory_count+"x "+cart.products[i].title+"..."); //purchase the product
            }else{
                store.products[goodId].inventory_count += cart.products[i].inventory_count
                console.log("ERROR: Not enough "+cart.products[i].title+" in stock... INVALID PURCHASE."); // if there arnt enough... its an invalid purchase
                validPurchase = false;
                break;
            }

            if (!validPurchase){
                break;
            }
        }
        
        if (validPurchase){ // if the purchase was valid
                let cost = 0;
            for (let i in cart.products) {
                cost += (cart.products[i].price*cart.products[i].inventory_count) //determine the total cost
            }
            console.log("$"+cost+" Is the total cost.");
            res.send("$"+cost+" Is the total cost.");


            //reset the cart now that you've bought what was in it before
            for (let i in cart.products) {
                for (let j in store.products) {
                    if(cart.products[i].id == store.products[j].id){
                        cart.products[i].inventory_count = 0;
                        break;
                    }
                }
            }
            cart.products = null
            console.log("Clearing Cart...");
        }

    }else{ // if your cart was empty
        console.log("ERROR: No products in cart.");
        res.send("ERROR: No products in cart.");
    }
    
    
});

//DELETE request for clearing current cart
app.delete("/api/cart", (req, res) =>{
    if (cart.products == null){
        console.log("ERROR: You haven't created a cart.")
        console.log("make a POST request to /api/cart to create a cart.")
        res.send("ERROR: You haven't created a cart.");
    }else{
        cart.products = null
        console.log("Deleted Cart...");
        res.send("Deleted Cart...");
    }
    
});



//POST request, add product to cart
app.post("/api/cart/add/:id", (req, res) =>{
   
    let id = req.params.id; //holds current product id

    if (cart.products == null){ // if the cart doesn't exist.. theres an error
        console.log("ERROR: You haven't created a cart.");
        console.log("make a POST request to /api/cart to create a cart.");
        res.send("ERROR: You haven't created a cart.");
    }else{
        if (store.products[id] != null){ // if the product is a real product
            if(store.products[id].inventory_count > 0){ // if the product is in stock
                
                if (cart.products != []){ // if the cart is not empty
                  
                    productIsInCart = false;//boolean that will be triggered if the selected product is already in the cart

                    for (let i in cart.products) {//loop through to see if the product is already in the cart
                        if (store.products[id].id == cart.products[i].id){ //if it is...
                            productIsInCart = true; 
                            break;
                        }
                    }

                    if (productIsInCart){ //if the product is already in the cart
                        
                        //store.products[id].inventory_count -=1; //decrease the store's inventory count of our specified product
                        let goodId = 0;

                        for (let i in cart.products){
                            if(cart.products[i].id == id){
                                goodId = i;
                            }
                        }
                        cart.products[goodId].inventory_count +=1; //increase the cart's inventory count of our specified product
                        console.log("Added "+store.products[id].title+" to the cart...");
                        res.send("Added "+store.products[id].title+" to the cart...");
                    }else{ //if the product isnt in the cart
                      
                        //add it to the cart
                        let product = {"id":store.products[id].id,"title":store.products[id].title, "price":store.products[id].price, "inventory_count":1};
                        cart.products.push(product); // put the product in the cart
                        //store.products[id].inventory_count -=1; // take one out of the available store inventory

                        console.log("Added "+store.products[id].title+" to the cart...");
                        res.send("Added "+store.products[id].title+" to the cart...");
                    }
                 
                }else{ // if the cart is empty... put the product in
                    let product = {"id":store.products[id].id,"title":store.products[id].title, "price":store.products[id].price, "inventory_count":1};
                  
                    cart.products.push(product); // put the product in the cart
                   // store.products[id].inventory_count -=1; // take one out of the available store inventory
                }
           
            }else{ // if the product is not in stock, throw an error
                console.log("ERROR: Not in stock, cannot purchase product.");
                res.send("ERROR: Not in stock, cannot purchase product.");
            }
        }else{ // if the product does not exist
            console.log("ERROR: Invalid ID, cannot purchase product.");
            res.send("ERROR: Invalid ID, cannot purchase product.");
        }
    }  
    
});



app.listen(3000,() =>{
    console.log("Server is up and listening on port 3000...")
    console.log("Go to: http://localhost:3000/api/products to view all products in the marketplace.")
});