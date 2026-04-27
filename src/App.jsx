import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import Navbar from './Navbar';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import CourseList from './CourseList';
import CourseDetail from './CourseDetail';
import CreateCourse from './CreateCourse';
import MyCourses from './MyCourses';
import LessonEdit from "./LessonEdit";
// Himoyalangan route — faqat login qilganlar uchun
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access');
    return token ? children : <Navigate to="/login" replace />;
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Routes>
                {/* Ochiq routelar */}
                <Route path="/"          element={<Home />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />
                <Route path="/courses"   element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/:courseId/lessons/:lessonId/edit" element={<LessonEdit />} />

                {/* Himoyalangan routelar */}
                <Route path="/dashboard" element={
                    <PrivateRoute><CourseList /></PrivateRoute>
                } />
                <Route path="/create-course" element={
                    <PrivateRoute><CreateCourse /></PrivateRoute>
                } />
                <Route path="/my-courses" element={
                    <PrivateRoute><MyCourses /></PrivateRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              
            </Routes>
        </>
    );
}

export default App;