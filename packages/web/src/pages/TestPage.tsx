import SplitText from "../components/ui/SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

export default function TestPage() {
    // Тестовая страница авторизации
    return (
        <div className="min-w-full min-h-full flex flex-col">
            <div className="justify-center items-center top-1/2 flex h-[80%] w-[100%] bg-gray-200">
                <SplitText
                    text="Hello, GSAP!"
                    className="text-2xl font-semibold text-center"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                    onLetterAnimationComplete={handleAnimationComplete}
                />
            </div>
        </div>
   );
}