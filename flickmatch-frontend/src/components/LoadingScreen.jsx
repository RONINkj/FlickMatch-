// src/components/LoadingScreen.jsx

export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <h1 className="text-white text-4xl font-semibold tracking-wide opacity-90">
                FlickMatch<span className="dots"></span>
            </h1>

            <style>
                {`
          .dots::after {
            content: '';
            animation: dots 1.2s steps(4, end) infinite;
          }

          @keyframes dots {
            0% { content: ''; }
            25% { content: '.'; }
            50% { content: '..'; }
            75% { content: '...'; }
            100% { content: ''; }
          }
        `}
            </style>
        </div>
    );
}   
