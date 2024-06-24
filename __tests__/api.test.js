
jest.mock('../api/api', () => {
    const mockCreateUsers = jest.fn();
    const mockCreatePost = jest.fn();
    const mockDeletePostById  = jest.fn();
    const mockUpdatePostByUserId = jest.fn();
    const mockGetUserById = jest.fn();
    const mockGetPostByUserId = jest.fn();
    const mockGetCommentsByPostId = jest.fn();
    const mockCreateCommentToPost = jest.fn();
    const mockDeleteCommentById = jest.fn();
    const mockDeleteUserById = jest.fn();

    return {
      
      updatePostByUserId: mockUpdatePostByUserId ,
      deletePostById: mockDeletePostById,
      createPost: mockCreatePost,
      createUsers: mockCreateUsers,
      deleteUserById:mockDeleteUserById,
      getUserById:mockGetUserById, 
      getPostByUserId:mockGetPostByUserId,
      getCommentsByPostId:mockGetCommentsByPostId,
      createCommentToPost:mockCreateCommentToPost,
      deleteCommentById:mockDeleteCommentById
    };
  });

  const { 
    getUserById,
    updatePostByUserId, 
    deletePostById, 
    deleteUserById,
    createPost, 
    createUsers,
    getPostByUserId,
    getCommentsByPostId,
    createCommentToPost,
    deleteCommentById, 
  } = require('../api/api');
  
  const mockUser = {
    id:123,
    name:"Jhon",
    code:"Jhon2115",
  };

  const mockComment ={
    id:2115,
    userName:"Jhon",
    comment:"wow",
    userId:123,
    postId:15
  }

  const mockPost={
    id:15,
    title:"Anka Lewandowska",
    content:"Strzela gola!",
    userId:123,
  }

  describe('User API Functions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('save a user to the database and retrieve it', async () => {
        
        await createUsers(mockUser);
        
        getUserById.mockResolvedValue([mockUser]); 
        const getUserResult = await getUserById(mockUser.id);
        //console.log(getUserResult)
        expect(getUserResult[0]).toEqual(mockUser); 
    });
    test('delete user from the db',async()=>{
      await createUsers(mockUser);
      await deleteUserById(mockUser.id);
      
      getUserById.mockResolvedValue([]); 
      const getUserResult = await getUserById(mockUser.id);
      
      expect(getUserResult.length).toBe(0);
    })
    
    
  });

  describe('Post API Functions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('Save a post to the database', async () => {
        await createPost(mockPost);
        
        getPostByUserId.mockResolvedValue([mockPost]); 

        const getPostResult = await getPostByUserId(mockPost.userId);
        
        expect(getPostResult[0]).toEqual(mockPost); 

    });

    test('Delete a post from db', async () => {
        
        await createPost(mockPost);
        await deletePostById(mockPost.id);
        
        getPostByUserId.mockResolvedValue([]); 
        const getPostResult = await getPostByUserId(mockPost.userId);
        
        expect(getPostResult.length).toBe(0);
      });
    
      test("Update a post from db",async ()=>{
            await createPost(mockPost);
            await updatePostByUserId(mockPost.userId,{title:"new title"},{content:"new content"});

            getPostByUserId.mockResolvedValue([mockPost]);

            const updatedResult = mockPost;
            updatedResult.content = "new content";
            updatedResult.title = "new title";
            const getPostResult = await getPostByUserId(mockPost.userId);

            expect(getPostResult[0]).toEqual(updatedResult); 
        });
      
    

        describe('Comment API Functions', () => {
            afterEach(() => {
              jest.clearAllMocks();
            });
          
            test('Save a comment to the database and retrieve it', async () => {
                
                
                await createCommentToPost(mockComment);
                
                getCommentsByPostId.mockResolvedValue([mockComment]); 

                const getCommentResult = await getCommentsByPostId(mockComment.postId);
                //console.log(getPostResult)
                
                expect(getCommentResult[0]).toEqual(mockComment); 
               
            });
            test('Delete a comment from the database', async () => {
                
                
                await createCommentToPost(mockComment);
                await deleteCommentById(mockComment.id);
                
                getCommentsByPostId.mockResolvedValue([]); 

                const getCommentResult = await getCommentsByPostId(mockComment.postId);
                
                expect(getCommentResult.length).toBe(0); 
               
            });
            
            
          });
  });