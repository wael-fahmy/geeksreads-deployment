const config = require('config');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {Books,validate} = require('../models/Book');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//Find book by ID.
/**
 * @api {GET} /api/books/id Find book by BookId
 * @apiVersion 0.0.0
 * @apiName GetBook
 * @apiGroup Books
 *
 *
 * @apiParam  {string} book_id Book ID.
 *
 * @apiSuccess {String} BookId         Book-ID.
 * @apiSuccess {String} Title         Book-Title.
 * @apiSuccess {String} AuthorId         Author-ID.
 * @apiSuccess {String} ISBN         Book-ISBN.
 * @apiSuccess {DatePicker} Published         Date when book was published.
 * @apiSuccess {String} Publisher         The name of the book's publisher.
 * @apiSuccess {Number}   Pages       Number of book pages.
 * @apiSuccess {String} Description         Small breifing about the book's contents.
 * @apiSuccess {String} Cover         Link that holds the book's cover picture.
 * @apiSuccess {String[]} Store         Links for webpages that store the book.
 * @apiSuccess {Select} ReadStatus         Read, Currently Reading, or Want to Read.
 * @apiSuccess {Number}   BookRating       Rating for the book.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "BookId":"5c911452bbfd1717b8a7a169",
 *       "Title":"sit",
 *       "AuthorId":"5c911452a48b42bb84bc785c",
 *       "ISBN":"5c911452ce18b2b3276d4b45",
 *       "Published":"2001-05-08 ",
 *       "Publisher":"COREPAN",
 *       "Pages":226.0,
 *       "Description":"Ad officia duis enim occaecat ullamco aliqua sint mollit non ea et ea aliqua ea. Reprehenderit eu ut in elit ex eu. Excepteur Lorem est ad amet sunt.\r\n",
 *       "Cover":"http://placehold.it/32x32",
 *       "Store":["http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32"],
 *       "ReadStatus":"Read",
 *       "BookRating":5.0,
 *       "Genre":"Horror"
 *     }
 *
 *
 * @apiError Book-not-found   The <code>Book</code> was not found.
 */

router.get('/id', async (req,res) => {
  
        
      
   mongoose.connection.collection("books").findOne({BookId:req.query.book_id},
   (err,doc) =>{
    
     if(!doc || err)
     {
       res.status(404).json({  // sends a json with 404 code
         success: false ,  // book not retrieved  
          "Message":"Book ID not  found !"});
     }
      else
      {
      res.status(200).json(doc);
     
      }
     }
 
 
   )}); 

//Find book by title, author, or ISBN.
/**
 * @api {GET} /api/books/author Find book by title, authorID, or ISBN. 
 * @apiVersion 0.0.0
 * @apiName FindBooks
 * @apiGroup Books 
 *
 *
 * @apiParam {String} search_param authorid or title or isbn
 * @apiSuccess {String} BookId         Book-ID.
 * @apiSuccess {String} Title         Book-Title.
 * @apiSuccess {String} AuthorId         Author-ID.
 * @apiSuccess {String} ISBN         Book-ISBN.
 * @apiSuccess {DatePicker} Published         Date when book was published.
 * @apiSuccess {String} Publisher         The name of the book's publisher.
 * @apiSuccess {Number}   Pages       Number of book pages.
 * @apiSuccess {String} Description         Small breifing about the book's contents.
 * @apiSuccess {String} Cover         Link that holds the book's cover picture.
 * @apiSuccess {String[]} Store         Links for webpages that store the book.
 * @apiSuccess {Select} ReadStatus         Read, Currently Reading, or Want to Read.
 * @apiSuccess {Number}   BookRating       Rating for the book.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "BookId":"5c911452bbfd1717b8a7a169",
 *       "Title":"sit",
 *       "AuthorId":"5c911452a48b42bb84bc785c",
 *       "ISBN":"5c911452ce18b2b3276d4b45",
 *       "Published":"2001-05-08 ",
 *       "Publisher":"COREPAN",
 *       "Pages":226.0,
 *       "Description":"Ad officia duis enim occaecat ullamco aliqua sint mollit non ea et ea aliqua ea. Reprehenderit eu ut in elit ex eu. Excepteur Lorem est ad amet sunt.\r\n",
 *       "Cover":"http://placehold.it/32x32",
 *       "Store":["http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32"],
 *       "ReadStatus":"Read",
 *       "BookRating":5.0,
 *       "Genre":"Horror"
 *     }
 *
 *
 * @apiError Book-not-found   The <code>Book</code> was not found.
 * @apiError Author-not-found   The <code>Author</code> was not found.
 */

router.get('/author', async (req,res) => {Books.find({ISBN:req.query.search_param},
  (err,doc) =>{
     
      console.log(doc);
        
      if(!doc|| doc.length ==0)
      {
        console.log(doc);
        Books.find({AuthorId:req.query.search_param},
          (err,doc) =>{
            if(!doc|| doc.length ==0)
            {
              console.log(doc);
              Books.find({Title:req.query.search_param},
                (err,doc) =>{
                  if(!doc|| doc.length ==0)
                  {
                    res.status(404).json({  // sends a json with 404 code
                      success: false ,  // book not retrieved  
                      "Message":"Search field not found in either ISBN, Title, or AuthorId !"});
                  }
                  else if (err)
                  {
                    res.status(404).json({  // sends a json with 404 code
                      success: false ,  // book not retrieved  
                      "Message":"No valid parameter is given !"});
                  }
                  else
                  {
                    console.log(doc);
                    res.status(200).json(doc);
                  }
  
                })
            }
             else if (err)
             {
              res.status(404).json({  // sends a json with 404 code
                success: false ,  // book not retrieved  
                 "Message":"No valid parameter is given !"});
             }
             else
             {
              res.status(200).json(doc);
             }
          })
      }
       else if (err)
       {
        res.status(404).json({  // sends a json with 404 code
          success: false ,  // book not retrieved  
           "Message":"No valid parameter is given !"});
       }
       else
       {
        res.status(200).json(doc);
       }
      }
  
  
    )}); 
  
//Get reviews from book by id 
/**
 * 
 * @api {GET} /api/books/reviewbyid Get book reviews by id 
 * @apiName GetReviewsbyBookId
 * @apiGroup Books
 * @apiVersion  0.0.0
 * 
 * 
 * @apiParam  {string} book_id Book ID.
 * @apiParam {number} [rating=0] Limit reviews to a particular rating or above,(default is 0).
 * 
 * @apiSuccess {string} UserId User-ID.
 * @apiSuccess {string} BookId Book-ID.
 * @apiSuccess {string} ReviewId Review-ID.
 * @apiSuccess {string} ReviewBody The text for the review entered by user.
 * @apiSuccess {DatePicker} ReviewDate Date where review was entered by user.
 * @apiSuccess {Number}   ReviewRating       Rating for the review.
 * 
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *          "ReviewId":"5c9243a5beb4101160e23fdd",
 *          "BookId":"5c9114a012d11bb226399497",
 *          "UserId":"5c9132dd47cb909f7fbbe875",
 *          "ReviewRating":5.0,
 *          "ReviewBody":"Mollit tempor consequat magna officia occaecat laborum duis consequat qui sunt ipsum. Commodo cillum voluptate incididunt mollit non non voluptate cillum id magna qui laborum ullamco adipisicing. Dolore consequat fugiat ut Lorem incididunt ea dolore voluptate aliquip. Reprehenderit duis est do ad consequat ad enim pariatur ad Lorem Lorem enim officia exercitation. Magna ea ipsum laborum sint est.\r\n",
 *          "ReviewDate":" 2015-12-03T02:44:27 -02:00"
 *          
 *     }
 * 
 * @apiError Book-Not-Found The <code>Book</code> was not found
 */


router.get('/reviewbyid', async (req,res) => {
  
        
      
  mongoose.connection.collection("Reviews").findOne({bookId:req.query.book_id},
  (err,doc) =>{
   
    if(!doc || err)
    {
      res.status(404).json({  // sends a json with 404 code
        success: false ,  // book not retrieved  
         "Message":"Book ID not  found !"});
    }
     else
     {
     res.status(200).json(doc);
    
     }
    }


  )}); 

//Get reviews from book by isbn 
/**
* 
* @api {GET} /api/books/reviewbyisbn Get book reviews by isbn 
* @apiName GetReviewsbyBookId
* @apiGroup Books
* @apiVersion  0.0.0
* 
* 
* @apiParam  {string} book_isbn Book ISBN.
* @apiParam {number} [rating=0] Limit reviews to a particular rating or above,(default is 0).
* 
* @apiSuccess {string} UserId User-ID.
* @apiSuccess {string} BookId Book-ID.
* @apiSuccess {string} ReviewId Review-ID.
* @apiSuccess {string} ReviewBody The text for the review entered by user.
* @apiSuccess {DatePicker} ReviewDate Date where review was entered by user.
* @apiSuccess {Number}   ReviewRating       Rating for the review.
* 
* @apiSuccessExample {json} Success
*     HTTP/1.1 200 OK
*     {
*          "ReviewId":"5c9243a5beb4101160e23fdd",
*          "BookId":"5c9114a012d11bb226399497",
*          "UserId":"5c9132dd47cb909f7fbbe875",
*          "ReviewRating":5.0,
*          "ReviewBody":"Mollit tempor consequat magna officia occaecat laborum duis consequat qui sunt ipsum. Commodo cillum voluptate incididunt mollit non non voluptate cillum id magna qui laborum ullamco adipisicing. Dolore consequat fugiat ut Lorem incididunt ea dolore voluptate aliquip. Reprehenderit duis est do ad consequat ad enim pariatur ad Lorem Lorem enim officia exercitation. Magna ea ipsum laborum sint est.\r\n",
*          "ReviewDate":" 2015-12-03T02:44:27 -02:00"
*          
*     }
* 
* @apiError Book-Not-Found The <code>Book</code> was not found
*/
router.get('/reviewbyisbn', async (req,res) => {


mongoose.connection.collection("books").findOne({ISBN:req.query.book_isbn},
(err,doc) =>{

if(!doc || err)
{
res.status(404).json({  // sends a json with 404 code
  success: false ,  // book not retrieved  
   "Message":"Book ISBN not  found !"});
}
else
{
 book_id  = doc.BookId;
 mongoose.connection.collection("Reviews").findOne({bookId:book_id},
  (err,doc) =>{
   
    if(!doc || err)
    {
      res.status(404).json({  // sends a json with 404 code
        success: false ,  // book not retrieved  
         "Message":"Book ID not  found !"});
    }
     else
     {
     res.status(200).json(doc);
    
     }
    }


  )
}
}


)}); 

//Get reviews from book by Title 
/**
* 
* @api {GET} /api/books/reviewbytitle Get book reviews by title 
* @apiName GetReviewsbyBookId
* @apiGroup Books
* @apiVersion  0.0.0
* 
* 
* @apiParam  {string} book_title Book title.
* @apiParam {number} [rating=0] Limit reviews to a particular rating or above,(default is 0).
* 
* @apiSuccess {string} UserId User-ID.
* @apiSuccess {string} BookId Book-ID.
* @apiSuccess {string} ReviewId Review-ID.
* @apiSuccess {string} ReviewBody The text for the review entered by user.
* @apiSuccess {DatePicker} ReviewDate Date where review was entered by user.
* @apiSuccess {Number}   ReviewRating       Rating for the review.
* 
* @apiSuccessExample {json} Success
*     HTTP/1.1 200 OK
*     {
*          "ReviewId":"5c9243a5beb4101160e23fdd",
*          "BookId":"5c9114a012d11bb226399497",
*          "UserId":"5c9132dd47cb909f7fbbe875",
*          "ReviewRating":5.0,
*          "ReviewBody":"Mollit tempor consequat magna officia occaecat laborum duis consequat qui sunt ipsum. Commodo cillum voluptate incididunt mollit non non voluptate cillum id magna qui laborum ullamco adipisicing. Dolore consequat fugiat ut Lorem incididunt ea dolore voluptate aliquip. Reprehenderit duis est do ad consequat ad enim pariatur ad Lorem Lorem enim officia exercitation. Magna ea ipsum laborum sint est.\r\n",
*          "ReviewDate":" 2015-12-03T02:44:27 -02:00"
*          
*     }
* 
* @apiError Book-Not-Found The <code>Book</code> was not found
*/
router.get('/reviewbytitle', async (req,res) => {


mongoose.connection.collection("books").findOne({Title:req.query.book_title},
(err,doc) =>{

if(!doc || err)
{
res.status(404).json({  // sends a json with 404 code
  success: false ,  // book not retrieved  
   "Message":"Book Title not  found !"});
}
else
{
 book_id  = doc.BookId;
 mongoose.connection.collection("Reviews").findOne({bookId:book_id},
  (err,doc) =>{
   
    if(!doc || err)
    {
      res.status(404).json({  // sends a json with 404 code
        success: false ,  // book not retrieved  
         "Message":"Book ID not  found !"});
    }
     else
     {
     res.status(200).json(doc);
    
     }
    }


  )
}
}


)}); 




        //convert isbns to ids
        /**
 * 
 * @api {get} /api/books/isbn Get Geeksreads book IDs given ISBNs
 * @apiName IsbntoId
 * @apiGroup Books
 * @apiVersion  0.0.0
 * 
 * 
 * @apiParam  {string[]} isbns Book-ISBNs.
 * 
 * @apiSuccess {string[]} ids Book-IDs.
 * 
 *  @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "BookIds": [5c911452bbfd1717b8a7a169,5c9114526f1439874b7cca1a]
 *     }
 * 
 * @apiError Books-Not-Found Some or all of the ISBNs entered are not valid.
 */

router.get('/isbn', async (req,res) => {
  
 
   mongoose.connection.collection("books").findOne({BookIsbn:req.query.book_isbn},
   (err,doc) =>{
    
     if(!doc || err)
     {
       res.status(404).json({  // sends a json with 404 code
         success: false ,  // book not retrieved  
          "Message":"Book ISBN not  found !"});
     }
      else
      {
      res.status(200).json(doc);
     
      }
     }
 
 
   )}); 

       
/**
 * @api {GET} /api/books/genre Find all books with the same Genre
 * @apiVersion 0.0.0
 * @apiName GetBooksByGerne
 * @apiGroup Books
 *
 *
 * @apiParam  {string} Genre the specfic Genre name
 *
 * @apiSuccess {String} BookId         Book-ID.
 * @apiSuccess {String} Title         Book-Title.
 * @apiSuccess {String} AuthorId         Author-ID.
 * @apiSuccess {String} ISBN         Book-ISBN.
 * @apiSuccess {DatePicker} Published         Date when book was published.
 * @apiSuccess {String} Publisher         The name of the book's publisher.
 * @apiSuccess {Number}   Pages       Number of book pages.
 * @apiSuccess {String} Description         Small breifing about the book's contents.
 * @apiSuccess {String} Cover         Link that holds the book's cover picture.
 * @apiSuccess {String[]} Store         Links for webpages that store the book.
 * @apiSuccess {Select} ReadStatus         Read, Currently Reading, or Want to Read.
 * @apiSuccess {Number}   BookRating       Rating for the book.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "BookId":"5c911452bbfd1717b8a7a169",
 *       "Title":"sit",
 *       "AuthorId":"5c911452a48b42bb84bc785c",
 *       "ISBN":"5c911452ce18b2b3276d4b45",
 *       "Published":"2001-05-08 ",
 *       "Publisher":"COREPAN",
 *       "Pages":226.0,
 *       "Description":"Ad officia duis enim occaecat ullamco aliqua sint mollit non ea et ea aliqua ea. Reprehenderit eu ut in elit ex eu. Excepteur Lorem est ad amet sunt.\r\n",
 *       "Cover":"http://placehold.it/32x32",
 *       "Store":["http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32"],
 *       "ReadStatus":"Read",
 *       "BookRating":5.0,
 *       "Genre":"Horror"
 *     },
 *      {
 *       "BookId":"5c9114ddlfd2bbfd1717b8a7a169",
 *       "Title":"ssdst",
 *       "AuthorId":"5c911452a48b42bb84bc785c",
 *       "ISBN":"5c911452ce18b2b3276d4b45",
 *       "Published":"2001-05-08 ",
 *       "Publisher":"COREPAN",
 *       "Pages":226.0,
 *       "Description":"Ad officia duis enim occaecat ullamco aliqua sint mollit non ea et ea aliqua ea. Reprehenderit eu ut in elit ex eu. Excepteur Lorem est ad amet sunt.\r\n",
 *       "Cover":"http://placehold.it/32x32",
 *       "Store":["http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32","http://placehold.it/32x32"],
 *       "ReadStatus":"Read",
 *       "BookRating":5.0,
 *       "Genre":"Horror"
 *     },
 * {
 * ................
 * .............
 * }
 * 
 * 
 *
 *
 * @apiError genre-not-found   The <code>genre</code> was not found.
 */
router.get('/genre', async (req,res) => {
  
        
      
  Books.find({'Genre':req.query.Genre}).then
  (bookArr =>{
   
    if(bookArr.length==0)
    {
      res.status(404).json({  // sends a json with 404 code
        success: false ,  // book not retrieved 
        "Message":"No books with this Genre was Found"});
      }
     else
     {
     res.status(200).json(bookArr);
    
     }
    }).catch(err => res.status(404).json({ success: false }));


  });
 
module.exports = router;