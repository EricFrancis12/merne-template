import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';


export default function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate('/app');
        }, 1000);
    }, []);

    return (
        <div>
            Error: Not Found
        </div>
    )
}
