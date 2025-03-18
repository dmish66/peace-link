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


export const forgotPassword = async (email: string) => {
  // Replace with your actual redirect URL after password reset
  const redirectUrl = "http://localhost:5173/reset-password";
  try {
    return await account.createRecovery(email, redirectUrl);
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw error;
  }
};

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


// ============================== FOLLOW USER
export const followUser = async (currentUserId: string, targetUserId: string) => {
  try {
    const currentUserDoc = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, currentUserId);
    const targetUserDoc = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, targetUserId);

    const updatedFollowing = [...new Set([...currentUserDoc.following, targetUserId])];

    const updatedFollowers = [...new Set([...targetUserDoc.followers, currentUserId])];

    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, currentUserId, {
      following: updatedFollowing,
    });

    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, targetUserId, {
      followers: updatedFollowers,
    });

    return true;
  } catch (error) {
    console.error("Error following user:", error);
    return false;
  }
};


// ============================== UNFOLLOW USER
export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  try {
    const currentUserDoc = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, currentUserId);
    const targetUserDoc = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, targetUserId);

    const updatedFollowing = currentUserDoc.following.filter((id: string) => id !== targetUserId);

    const updatedFollowers = targetUserDoc.followers.filter((id: string) => id !== currentUserId);

    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, currentUserId, {
      following: updatedFollowing,
    });

    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, targetUserId, {
      followers: updatedFollowers,
    });

    return true;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return false;
  }
};


// ============================== GET FOLLOWER AND FOLLOWING COUNT
export const getFollowStats = async (userId: string) => {
  try {
    const userDoc = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, userId);
    return {
      followers: userDoc.followers.length,
      following: userDoc.following.length,
    };
  } catch (error) {
    console.error("Error fetching follow stats:", error);
    return { followers: 0, following: 0 };
  }
};


// ============================================================
// CONVERSATION
// ============================================================


// ============================== CREATE CONVERSATION
export async function createConversation(participants: string[]) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [
        Query.equal("participants", participants[0]),
        Query.equal("participants", participants[1]),
      ]
    );
    
    const existingConversation = result.documents.find((doc: any) => {
      const docParticipants: string[] = doc.participants;
      if (docParticipants.length !== participants.length) return false;
      return participants.every((p) => docParticipants.includes(p));
    });
    
    if (existingConversation) {
      return existingConversation;
    }

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


// ============================== SEND MESSAGE
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


// ============================== GET CONVERSATIONS
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


// ============================== GET MESSAGES
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


// ============================== GET CONVERSATION DETAILS
export async function getConversationDetails(conversationId: string) {
  try {
    const conversation = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId
    );

    return conversation; 
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    throw error;
  }
}


// ============================== GET THE USERNAME AND IMAGE OF THE OTHER USER OF THE CONVERSATION
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
      nationality: otherUserDetails.nationality,
    };
  } catch (error) {
    console.error("Error fetching other user details:", error);
    throw error;
  }
};


// ============================== GET LAST MESSAGE OF CONVERSATION
export const getSingleMessage = async (messageId: string) => {
  try {
    const message = await databases.getDocument(
      appwriteConfig.databaseId, // Your database ID
      appwriteConfig.text_messagesCollectionId, // Your messages collection ID
      messageId // The ID of the message to fetch
    );
    return message;
  } catch (error) {
    console.error("Error fetching single message:", error);
    throw error;
  }
};

// ============================================================
// FORUM
// ============================================================


// ============================== CREATE FORUM
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


// ============================== GET FORUMS
export const getForums = async () => {
  return await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.forumsCollectionId
  );
};


// ============================== GET FORUM MESSAGES
export const getForumMessages = async (forumId: string) => {
  return await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.forums_messagesCollectionId, 
    [
    Query.equal("forumId", [forumId]),
  ]);
};


// ============================== POST MESSAGE
export const postMessage = async (forumId: string, text: string, senderId: string, username: string) => {
  return await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.forums_messagesCollectionId,
    ID.unique(),
    {
      forumId,
      text,
      senderId,
      username,
      createdAt: new Date().toISOString(),
    }
  );
};


// ============================== GET FORUM DETAILS
export const getForumDetails = async (forumId: string) => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.forumsCollectionId,
      forumId
    );
    return response;
  } catch (error) {
    console.error("Error fetching forum details:", error);
    throw error;
  }
};


// ============================== GET USER'S FORUMS
export const getMyForums = async (userId: string) => {
  try {
    return await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.forumsCollectionId,
      [
        Query.equal("createdBy", userId)
      ]
    );
  } catch (error) {
    console.error("Error fetching user-created forums:", error);
    return { documents: [] };
  }
};


// ============================== DELETE FORUM
export const deleteForum = async (forumId: string) => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.forumsCollectionId,
      forumId
    );
    console.log("Forum deleted:", forumId);
    return true;
  } catch (error) {
    console.error("Error deleting forum:", error);
    return false;
  }
};


// ============================== UPDATE FORUM
export const updateForum = async (forumId: string, title: string, description: string) => {
  try {
    const updatedForum = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.forumsCollectionId,
      forumId,
      { title, description }
    );
    console.log("Forum updated:", updatedForum);
    return updatedForum;
  } catch (error) {
    console.error("Error updating forum:", error);
    return null;
  }
};




export const createEvent = async (
  title: string,
  description: string,
  country: string,
  date: string,
  imageFile: File,
  location: string,
  organizer: string
) => {
  if (!title || !country || !date) {
    throw new Error("Required fields are missing");
  }

  // Upload image to storage
  const image = await storage.createFile(appwriteConfig.storageId, ID.unique(), imageFile);
  
  return await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.eventsCollectionId, ID.unique(), {
    title,
    description,
    country,
    date,
    image: image.$id,
    location,
    organizer,
    createdAt: new Date().toISOString()
  });
};

// Get events by country
export const listEventsByCountry = async (country: string) => {
  try {
    const queries = [];
    if (country) {
      queries.push(Query.equal('country', country)); // Use Query builder
    }

    const response = await databases.listDocuments(
      appwriteConfig.databaseId, 
      appwriteConfig.eventsCollectionId, 
      queries
    );
    return response;
  } catch (error) {
    console.error("API Error:", error);
    return { documents: [] };
  }
};


// Get all countries with events
export const getEventCountries = async () => {
  const result = await databases.listDocuments(
    appwriteConfig.databaseId, 
    appwriteConfig.eventsCollectionId
  );
  
  return [
    ...new Set(
      result.documents
        .map(event => event.country)
        .filter(country => country)
    )
  ].sort();
};

// Get event image URL
export const getEventImageUrl = (fileId: string) => {
  return storage.getFilePreview(appwriteConfig.storageId, fileId);
};

export const getEventById = async (eventId: string) => {
  return databases.getDocument(appwriteConfig.databaseId, appwriteConfig.eventsCollectionId, eventId);
};

export const attendEvent = async (eventId: string, userId: string) => {
  try {
    const event = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.eventsCollectionId, eventId);
    let attendees = event.attendees || [];

    // Avoid duplicate attendance
    if (!attendees.includes(userId)) {
      attendees.push(userId);
    }

    const updatedEvent = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.eventsCollectionId,
      eventId,
      { attendees }
    );

    console.log("Updated event:", updatedEvent);
    return updatedEvent;
  } catch (error) {
    console.error("Error updating attendees:", error);
    throw error;
  }
};

export const listMyEvents = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.eventsCollectionId,
      [Query.equal("organizer", [userId])]
    );
    return response;
  } catch (error) {
    console.error("Error fetching user events:", error);
    return { documents: [] };
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.eventsCollectionId, eventId);
    console.log("Event deleted successfully!");
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, data: any) => {
  let imageId = data.image;
  
  if (data.image instanceof File) {
    const newImage = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      data.image
    );
    imageId = newImage.$id;
  }

  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.eventsCollectionId,
    eventId,
    {
      ...data,
      image: imageId,
      date: new Date(data.date).toISOString()
    }
  );
};

export const unattendEvent = async (eventId: string, userId: string) => {
  try {
    // Fetch the current event
    const event = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.eventsCollectionId,
      eventId
    );

    // Remove the user from the attendees list
    const updatedAttendees = event.attendees.filter((id: string) => id !== userId);

    // Update the event with the new attendees list
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.eventsCollectionId,
      eventId,
      { attendees: updatedAttendees }
    );

    return response;
  } catch (error) {
    console.error("Error unattending event:", error);
    return null;
  }
};
