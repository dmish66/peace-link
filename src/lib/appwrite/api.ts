import { ID, Query, ImageGravity } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = new URL(avatars.getInitials(user.name));

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email:newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
      nationality: user.nationality,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
  nationality: string;
  
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string): string {
  return storage.getFilePreview(
    appwriteConfig.storageId,
    fileId,
    2000,
    2000,
    ImageGravity.Top,
    100
  );
}


// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = new URL(getFilePreview(uploadedFile.$id));
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        nationality: user.nationality,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}



export async function createConversation(participants: string[]) {
  try {
    // Check for an existing conversation containing both participants.
    // This query returns documents where the "participants" array includes both values.
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [
        Query.equal("participants", participants[0]),
        Query.equal("participants", participants[1]),
      ]
    );
    
    // Find a conversation that has exactly the same participants (in any order).
    const existingConversation = result.documents.find((doc: any) => {
      const docParticipants: string[] = doc.participants;
      if (docParticipants.length !== participants.length) return false;
      return participants.every((p) => docParticipants.includes(p));
    });
    
    if (existingConversation) {
      // Return the existing conversation without creating a new one.
      return existingConversation;
    }

    // If no matching conversation exists, create a new one.
    const conversation = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      ID.unique(),
      { 
        participants, 
        lastMessage: "", 
        updatedAt: new Date().toISOString() 
      }
    );
    return conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}


export async function sendMessage(conversationId: string, senderId: string, text: string) {
  try {
    const message = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.text_messagesCollectionId,
      ID.unique(),
      { conversationId, senderId, text, createdAt: new Date().toISOString() }
    );

    // Update the conversation's last message
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId,
      { lastMessage: text, updatedAt: new Date().toISOString() }
    );

    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function getConversations(userId: string) {
  try {
    const conversations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [Query.contains("participants", userId)] // Query conversations where userId is a participant
    );

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

export async function getMessages(conversationId: string) {
  try {
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.text_messagesCollectionId,
      [Query.equal("conversationId", conversationId)]
    );
    return messages.documents;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export async function getConversationDetails(conversationId: string) {
  try {
    const conversation = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId
    );

    return conversation; // Returns details of a single conversation
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    throw error;
  }
}


export const getOtherUserDetails = async (conversationId: string, currentUserId: string) => {
  try {
    // Get the conversation document to obtain the participants
    const conversation = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId
    );
    // Find the other user's ID
    const otherUserId = conversation.participants.find((id: string) => id !== currentUserId);
    if (!otherUserId) {
      throw new Error("Other user not found in conversation.");
    }
    // Get the other user's details (assume the image URL is stored as imageUrl)
    const otherUserDetails = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      otherUserId
    );
    return {
      username: otherUserDetails.username,
      profileImage: otherUserDetails.imageUrl, // Use imageUrl property
    };
  } catch (error) {
    console.error("Error fetching other user details:", error);
    throw error;
  }
};


// Create a new forum
export const createForum = async (
  title: string,
  description: string,
  theme: string,
  createdBy: string
) => {
  const allowedThemes = [
    "Refugee crises",
    "Cultural conflicts",
    "Social problems",
    "International relations",
  ];

  if (!allowedThemes.includes(theme)) {
    throw new Error("Invalid theme selected.");
  }

  return await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.forumsCollectionId,
    ID.unique(), 
    {
      title,
      description,
      theme,
      createdBy,
      createdAt: new Date().toISOString(),
  });
};

// Get all forums
export const getForums = async () => {
  return await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.forumsCollectionId
  );
};

// Get messages for a specific forum
export const getForumMessages = async (forumId: string) => {
  return await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.forums_messagesCollectionId, 
    [
    Query.equal("forumId", [forumId]),
  ]);
};

// Post a message in a forum
export const postMessage = async (forumId: string, text: string, senderId: string) => {
  return await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.forums_messagesCollectionId,
    ID.unique(), 
    {
      forumId,
      text,
      senderId,
      createdAt: new Date().toISOString(),
  });
};