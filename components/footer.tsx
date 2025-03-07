import Image from "next/image";

export default function Footer() {
    return (
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
            <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://discord.gg/HMYynb2H"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    aria-hidden
                    src="/discord.webp"
                    alt="Discord Icon"
                    width={16}
                    height={16}
                />
                Discord.com
            </a>            
            <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://www.reddit.com/r/SecFilings"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    aria-hidden
                    src="/reddit.png"
                    alt="Reddit Icon"
                    width={16}
                    height={16}
                />
                Reddit.com
            </a>
            <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://stocktwits.com/SecTrigger"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    aria-hidden
                    src="/stocktwits.png"
                    alt="Stock Twits Icon"
                    width={16}
                    height={16}
                    className="rounded-full"
                />
                StockTwits.com
            </a>
            <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://x.com/SecTrigger"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    aria-hidden
                    src="/twitter.svg"
                    alt="Twitter Icon"
                    width={16}
                    height={16}
                />
                X.com
            </a>
        </footer>
    );
}
