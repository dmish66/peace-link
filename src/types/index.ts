export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
  };
  
  export type IUpdateUser = {
    userId: string;
    name: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
  };
  
  export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: URL;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    nationality: string; 
  };
  
  export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
    nationality: string; 
  };
  
  export type IConversationList = {
    onSelectConversation: (conversationId: string) => void;
  };
  
  export type IConversation = {
    $id: string;
    participants: string[];
    lastMessage: string;
  };

  export type IChatWindow = {
    conversationId: string;
    profileImage: string;
    username: string;
  };

  export type IMessage = {
    $id: string;
    text: string;
    createdAt: string;
    senderId: string;
  };

  export type RouteParams = {
    conversationId: string;
  }

  export type IChatHeader = {
    profileImage: string;
    name: string;
  }