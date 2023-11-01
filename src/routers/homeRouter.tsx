import React from 'react';
import CardLibrary from '../pages/CardLibrary';
// import MemoTrash from '@/pages/MemoTrash';
// import MemoArchive from '@/pages/MemoArchive';
// import MemoReview from '@/pages/MemoReview';

const homeRouter = {
    // '/recycle': <MemoTrash/>,
    // '/archive': <MemoArchive/>,
    // '/review': <MemoReview/>,
    '*': <CardLibrary/>,
};
export default homeRouter;
