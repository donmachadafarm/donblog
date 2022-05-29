export interface Post{
    _id: string;
    _createdAt: string;
    title: string;
    author: {
        name: string;
        image: string;
    };
    comments: Comment[];
    description: string;
    mainImage: {
        asset: {
            url: string;
        };
    };
    slug: {
        current: string;
    };
    body: [object];
}

export interface Comment{
    approved: boolean,
    _id: string,
    _createdAt: string,
    _updatedAt: string,
    _type: string,
    post: {
        _ref: string,
        _type: string,
    },
    name: string,
    email: string,
    comment: string,
}