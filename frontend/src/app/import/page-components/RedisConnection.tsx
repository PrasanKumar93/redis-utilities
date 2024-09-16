
import './RedisConnection.css'

interface RedisConnectionProps {
    testRedisUrl: string;
    setTestRedisUrl: (url: string) => void;
    evtClickEnterConUrl: () => Promise<void>;
}

const RedisConnection = ({
    testRedisUrl,
    setTestRedisUrl,
    evtClickEnterConUrl
}: RedisConnectionProps) => {
    return (
        <div className="import-redis-con-container">
            <div className="con-url-container">
                <div className="con-url-lbl roboto-medium pg001-single-line-label">Connection URL : </div>

                <input type="text"
                    placeholder="Enter Redis Connection URL"
                    className="con-url-textbox pg001-textbox"
                    value={testRedisUrl}
                    onChange={(e) => setTestRedisUrl(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key.toLowerCase() === 'enter') {
                            evtClickEnterConUrl();
                        }
                    }}
                    tabIndex={1}
                />

                <div className="fas fa-arrow-circle-right con-url-submit-icon enter"
                    title="Next"
                    onClick={evtClickEnterConUrl}></div>
                <div className="fas fa-check-circle con-url-submit-icon done" title="Connection successful"></div>
            </div>
        </div>
    );

}

export default RedisConnection;