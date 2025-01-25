export default function Leaderboard() {
    const topUsers = [
        { id: 1, name: "Alice", score: 200000 },
        { id: 2, name: "Bob", score: 180000 },
        { id: 3, name: "User", score: 150000 },
        { id: 4, name: "Charlie", score: 130000 },
        { id: 5, name: "David", score: 120000 },
        { id: 6, name: "Eve", score: 110000 },
        { id: 7, name: "default-user", score: 100000 },
        { id: 8, name: "Grace", score: 95000 },
        { id: 9, name: "Hannah", score: 90000 },
        { id: 10, name: "Ivy", score: 85000 },
        { id: 11, name: "Jack", score: 80000 },
    ];

    return (
        <div className="w-full flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Leaderboard</h2>
                    <a href="/" className="mr-1">
                        <button className="group relative inline-flex h-6 items-center justify-center overflow-hidden rounded-md bg-red-500 px-2 font-medium text-neutral-200 transition hover:scale-110">
                            <span>Back</span>
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-8 bg-white/20"></div>
                            </div>
                        </button>
                    </a>
                </div>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Top 10 Asset Managers</h3>
                        <div className="space-y-2">
                            {topUsers.slice(0, 10).map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`flex justify-between items-center p-2 rounded-md bg-gray-50
                     animate-stagger-fade-in opacity-0`}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    <span className="font-medium">{index + 1}. {user.name}</span>
                                    <span>{user.score.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}