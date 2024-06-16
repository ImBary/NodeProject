
jest.mock('../api/api', () => {
    const mockCreateUsers = jest.fn();
    const mockCreatePost = jest.fn();
    const mockDeletePostById  = jest.fn();
    const mockUpdatePostByUserId = jest.fn();
    const mockGetUserById = jest.fn();
    const mockGetPostByUserId = jest.fn();

    return {
      
      updatePostByUserId: mockUpdatePostByUserId ,
      deletePostById: mockDeletePostById,
      createPost: mockCreatePost,
      createUsers: mockCreateUsers,
      getUserById:mockGetUserById, 
      getPostByUserId:mockGetPostByUserId
    };
  });

  const { 
    getUserById,// done
    updatePostByUserId, 
    deletePostById, //done
    createPost, //done
    createUsers,//done
    getPostByUserId, //done
  } = require('../api/api');
  
  const mockUser = {
    id:123,
    name:"Jhon",
    code:"Jhon2115",
  };

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
        expect(createUsers).toHaveBeenCalledWith(mockUser);
    
        
        getUserById.mockResolvedValue([mockUser]); 
    
        
        const getUserResult = await getUserById(mockUser.id);
        expect(getUserById).toHaveBeenCalledWith(mockUser.id);
        //console.log(getUserResult)
        expect(getUserResult[0]).toEqual(mockUser); 
    });
    
    
  });

  describe('Post API Functions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('Save a post to the database', async () => {
        await createPost(mockPost);
        expect(createPost).toHaveBeenCalledWith(mockPost);
    
        
        getPostByUserId.mockResolvedValue([mockPost]); 

        const getPostResult = await getPostByUserId(mockPost.userId);
        //console.log(getPostResult)
        expect(getPostByUserId).toHaveBeenCalledWith(mockPost.userId);
        
        expect(getPostResult[0]).toEqual(mockPost); 

    });

    test('Delete a post from db', async () => {
        
        await createPost(mockPost);
        expect(createPost).toHaveBeenCalledWith(mockPost);
    
        
        await deletePostById(mockPost.id);
        expect(deletePostById).toHaveBeenCalledWith(mockPost.id);
    
        
        getPostByUserId.mockResolvedValue([]); 
        const getPostResult = await getPostByUserId(mockPost.userId);
        expect(getPostByUserId).toHaveBeenCalledWith(mockPost.userId);
    
        
        expect(getPostResult.length).toBe(0);
      });
    
      test("Update a post from db",async ()=>{
            await createPost(mockPost);
            expect(createPost).toHaveBeenCalledWith(mockPost);
    
            await updatePostByUserId(mockPost.userId,{title:"new title"},{content:"new content"});
            expect(updatePostByUserId).toHaveBeenCalledWith(mockPost.userId,{title:"new title"},{content:"new content"})

            getPostByUserId.mockResolvedValue([mockPost]);

            const updatedResult = mockPost;
            updatedResult.content = "new content";
            updatedResult.title = "new title";
            const getPostResult = await getPostByUserId(mockPost.userId);
            expect(getPostByUserId).toHaveBeenCalledWith(mockPost.userId);

            expect(getPostResult[0]).toEqual(updatedResult); 
        });
      
    
  });