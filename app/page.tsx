"use client"

import type React from "react"

import { useState, useEffect } from "react"

export default function VSLFunnelPage() {
  const [showStickyButton, setShowStickyButton] = useState(false)
  const [socialProofVisible, setSocialProofVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [videoFirstClick, setVideoFirstClick] = useState<{ [key: string]: boolean }>({})
  const [videoStates, setVideoStates] = useState<{
    [key: string]: { muted: boolean; playing: boolean; iframe?: HTMLIFrameElement }
  }>({})

  const socialProofData = [
    { name: "Mason", city: "LA" },
    { name: "Harper", city: "NYC" },
    { name: "Chase", city: "SF" },
    { name: "Riley", city: "ATL" },
    { name: "Austin", city: "PHX" },
    { name: "Cole", city: "CHI" },
    { name: "Kennedy", city: "BOS" },
    { name: "Ethan", city: "HOU" },
    { name: "Savannah", city: "SD" },
    { name: "Madison", city: "NYC" },
    { name: "Hunter", city: "DAL" },
    { name: "Avery", city: "SF" },
    { name: "Tyler", city: "BOS" },
    { name: "Hailey", city: "MIA" },
    { name: "Blake", city: "ATL" },
    { name: "Chloe", city: "LA" },
    { name: "Carter", city: "MIA" },
    { name: "Peyton", city: "DAL" },
    { name: "Jordan", city: "SEA" },
    { name: "Addison", city: "SD" },
    { name: "Brooklyn", city: "HOU" },
    { name: "Logan", city: "CHI" },
    { name: "Skylar", city: "PHX" },
    { name: "Kennedy", city: "SEA" },
  ]

  const [currentSocialProof, setCurrentSocialProof] = useState(socialProofData[0])
  const [currentTiming, setCurrentTiming] = useState("2 minutes ago")

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 800
      setShowStickyButton(scrolled)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const showSocialProof = () => {
      const randomIndex = Math.floor(Math.random() * socialProofData.length)
      const randomSeconds = Math.floor(Math.random() * 90) + 30
      let timingText

      if (randomSeconds < 60) {
        timingText = `${randomSeconds} seconds ago`
      } else {
        const minutes = (randomSeconds / 60).toFixed(1)
        timingText = `${minutes} min ago`
      }

      setCurrentSocialProof(socialProofData[randomIndex])
      setCurrentTiming(timingText)
      setSocialProofVisible(true)
      setTimeout(() => setSocialProofVisible(false), 4000)
    }

    const interval = setInterval(showSocialProof, 25000)
    setTimeout(showSocialProof, 8000) // Increased initial delay

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute("data-animate-id")
            if (elementId) {
              setVisibleElements((prev) => new Set([...prev, elementId]))
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    const animatedElements = document.querySelectorAll("[data-animate-id]")
    animatedElements.forEach((el) => observer.observe(el))

    return () => {
      clearTimeout(loadTimer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if message is from LeadConnector
      if (event.origin.includes("leadconnectorhq.com")) {
        console.log("[v0] Received message from LeadConnector:", event.data)

        // Check for booking completion indicators
        if (
          event.data?.type === "booking-completed" ||
          event.data?.event === "booking-completed" ||
          event.data?.status === "completed" ||
          (typeof event.data === "string" && event.data.includes("completed"))
        ) {
          console.log("[v0] Booking completed, redirecting...")
          window.location.href = "https://confirmations.salesmonarchs.com/"
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const scrollToCalendly = (e: React.MouseEvent) => {
    e.preventDefault()
    const embedElement = document.getElementById("9wRS0VS37GPm9WwZ48l5_1760626384859")
    if (embedElement) {
      embedElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleVideoPlay = (videoId: string, youtubeId: string) => {
    const isFirstClick = !videoFirstClick[videoId]

    if (isFirstClick) {
      // First click: start from beginning with sound and controls
      setVideoFirstClick((prev) => ({ ...prev, [videoId]: true }))
      setPlayingVideo(videoId)

      const iframe = document.createElement("iframe")
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&start=0&rel=0&modestbranding=1&controls=1&enablejsapi=1`
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.style.border = "none"
      iframe.style.borderRadius = "12px"
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      iframe.allowFullscreen = true

      const container = document.getElementById(`video-container-${videoId}`)
      if (container) {
        container.innerHTML = ""
        container.appendChild(iframe)

        // Store iframe reference for future play/pause
        setVideoStates((prev) => ({
          ...prev,
          [videoId]: { muted: false, playing: true, iframe },
        }))
      }
    } else {
      // Subsequent clicks: toggle play/pause using YouTube API
      const currentState = videoStates[videoId]
      if (currentState?.iframe) {
        const iframe = currentState.iframe
        const isPlaying = currentState.playing

        if (isPlaying) {
          // Pause the video
          iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
          setVideoStates((prev) => ({
            ...prev,
            [videoId]: { ...prev[videoId], playing: false },
          }))
        } else {
          // Play the video
          iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
          setVideoStates((prev) => ({
            ...prev,
            [videoId]: { ...prev[videoId], playing: true },
          }))
        }
      }
    }
  }

  const initializeAutoplayVideo = (videoId: string, youtubeId: string) => {
    // Only initialize if not already clicked
    if (!videoFirstClick[videoId]) {
      const iframe = document.createElement("iframe")
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&showinfo=0&enablejsapi=1`
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.style.border = "none"
      iframe.style.borderRadius = "12px"
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"

      const container = document.getElementById(`video-container-${videoId}`)
      if (container && !container.hasChildNodes()) {
        container.appendChild(iframe)
      }
    }
  }

  useEffect(() => {
    const videoData = [
      { id: "jake-turner", youtubeId: "G9J_EJ8-c8c" },
      { id: "matas-steponas", youtubeId: "hKgZOSnfiJw" },
      { id: "jordan-moss", youtubeId: "ghjEWvgUUMQ" },
      { id: "isiah-smith", youtubeId: "zpAWw7HodBM" },
      { id: "aymen-berrahma", youtubeId: "S5DJeEnAgbo" },
    ]

    const timer = setTimeout(() => {
      videoData.forEach(({ id, youtubeId }, index) => {
        if (playingVideo !== id) {
          setTimeout(() => {
            initializeAutoplayVideo(id, youtubeId)
          }, index * 500) // Stagger by 500ms each
        }
      })
    }, 3000) // Increased delay to 3 seconds

    return () => clearTimeout(timer)
  }, [playingVideo])

  return (
    <div className="min-h-screen text-foreground overflow-hidden" style={{ background: "#0B1344" }}>
      {socialProofVisible && (
        <div className="fixed top-4 right-4 z-50 glass-strong rounded-lg p-3 md:p-4 border border-blue-400/30 animate-slide-in-right max-w-[280px] md:max-w-none">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <p className="text-xs md:text-sm font-semibold text-foreground">Someone just applied!</p>
              <p className="text-xs text-muted-foreground">
                {currentSocialProof.name} from {currentSocialProof.city} - {currentTiming}
              </p>
            </div>
          </div>
        </div>
      )}

      {showStickyButton && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <button
            onClick={scrollToCalendly}
            className="w-full text-white font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all duration-500 text-base md:text-lg group relative overflow-hidden"
            style={{ backgroundColor: "#127CF5", boxShadow: "0 20px 40px -12px rgba(18, 124, 245, 0.6)" }}
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:animate-pulse"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
            </svg>
            Apply Now - Limited Time
          </button>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-float animation-delay-400"></div>
      </div>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center space-y-8 md:space-y-12 relative z-10">
          <div
            className={`transition-all duration-1000 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground border border-blue-400/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow"></div>
              Over 5M in Revenue for our clients in the last 365 days
            </div>
          </div>

          <div
            className={`space-y-6 md:space-y-8 transition-all duration-1000 ease-out ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground max-w-5xl mx-auto text-glow-strong leading-[1.1] px-2">
              Our SalesPimp system will guarantee you a{" "}
              <span className="bg-gradient-to-r from-blue-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent font-extrabold">
                22% increase
              </span>{" "}
              in your sales in the next{" "}
              <span className="bg-gradient-to-r from-blue-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent font-extrabold">
                69 Days
              </span>{" "}
              on a pay on results basis
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted max-w-4xl mx-auto leading-relaxed px-2">
              And yes — this System is as Cracked as it Sounds.
            </p>
          </div>

          <div
            className={`mt-12 md:mt-20 space-y-6 md:space-y-8 transition-all duration-1000 ease-out ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="w-full mx-auto">
              <iframe
                src="https://api.leadconnectorhq.com/widget/booking/9wRS0VS37GPm9WwZ48l5"
                className="w-full border-0"
                style={{
                  overflow: "auto",
                  minHeight: "700px",
                  height: "800px",
                }}
                id="9wRS0VS37GPm9WwZ48l5_1760626384859"
              ></iframe>
            </div>

            <button
              onClick={scrollToCalendly}
              className="inline-block text-white font-semibold py-4 px-6 md:px-8 rounded-full transition-all duration-500 text-base md:text-lg group relative overflow-hidden hover:scale-105 mx-2"
              style={{ backgroundColor: "#127CF5", boxShadow: "0 20px 40px -12px rgba(18, 124, 245, 0.4)" }}
            >
              <div className="relative flex items-center gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:animate-pulse"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
                  </svg>
                </div>
                Click Here to Increase your Sales
              </div>
            </button>
            <div className="mt-4">
              <p className="text-sm md:text-base text-yellow-400 font-medium animate-pulse px-2">
                ⚠️ Only 3 spots left this month
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`py-16 md:py-20 px-4 md:px-6 transition-all duration-1000 ease-out ${
          visibleElements.has("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        data-animate-id="testimonials"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 px-2">
              Client Results of{" "}
              <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Sales Monarchs
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: "Jake Turner",
                title: "Sales Coach for 10 Years",
                followers: "5K",
                helpDescription: "Helped him make 15K month consistently",
                instagramUrl: "https://www.instagram.com/consultingwithjake",
                youtubeId: "G9J_EJ8-c8c",
                videoId: "jake-turner",
              },
              {
                name: "Matas Steponas",
                title: "Sales Coach & Sales Agency owner",
                followers: "20K",
                helpDescription: "Helped him crack his business model to scale to 6 figures",
                instagramUrl: "https://www.instagram.com/matasstap",
                youtubeId: "hKgZOSnfiJw",
                videoId: "matas-steponas",
              },
              {
                name: "Jordan Moss",
                title: "Personal branding expert",
                followers: "120K",
                helpDescription: "Helped him scale from 0$ to $10,000 in 30 days",
                instagramUrl: "https://www.instagram.com/jmoss.co",
                youtubeId: "ghjEWvgUUMQ",
                videoId: "jordan-moss",
              },
              {
                name: "Isiah Smith",
                title: "Fitness coach",
                followers: "58K",
                helpDescription: "Helped him scale from 6K to 60K in 30 days running his sales team",
                instagramUrl: "https://www.instagram.com/nurse_ijay",
                youtubeId: "zpAWw7HodBM",
                videoId: "isiah-smith",
              },
              {
                name: "Aymen Berrahma",
                title: "One of the biggest marketing agency in Dubai",
                followers: "67K",
                helpDescription: "Helped him initially to scale now doing 120K/month",
                instagramUrl: "https://www.instagram.com/aymen_berrahma",
                youtubeId: "S5DJeEnAgbo",
                videoId: "aymen-berrahma",
              },
            ].map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`glass-strong rounded-2xl p-3 md:p-4 hover:scale-105 transition-all duration-500 group cursor-pointer ${
                  visibleElements.has("testimonials") ? "animate-slide-up" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[9/16] bg-gradient-to-br from-card to-background rounded-xl relative overflow-hidden mb-3 group">
                  <div
                    id={`video-container-${testimonial.videoId}`}
                    className="absolute inset-0 w-full h-full rounded-xl"
                  >
                    {!videoFirstClick[testimonial.videoId] && (
                      <img
                        src={`https://img.youtube.com/vi/${testimonial.youtubeId}/maxresdefault.jpg`}
                        alt={`${testimonial.name} testimonial thumbnail`}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://img.youtube.com/vi/${testimonial.youtubeId}/hqdefault.jpg`
                        }}
                      />
                    )}
                  </div>

                  {/* Play button overlay */}
                  <button
                    onClick={() => handleVideoPlay(testimonial.videoId, testimonial.youtubeId)}
                    className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                      {videoFirstClick[testimonial.videoId] && videoStates[testimonial.videoId]?.playing ? (
                        // Show pause icon when playing
                        <svg className="w-4 h-4 md:w-6 md:h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        // Show play icon when paused or first time
                        <svg
                          className="w-4 h-4 md:w-6 md:h-6 text-blue-600 ml-1"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 z-10">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-white text-xs font-medium">
                        {videoFirstClick[testimonial.videoId]
                          ? (videoStates[testimonial.videoId]?.playing ? "Playing" : "Paused") +
                            " - " +
                            testimonial.name +
                            "'s Success Story"
                          : "Watch " + testimonial.name + "'s Success Story"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-foreground">{testimonial.name}</h3>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </div>

                  <p className="text-xs text-blue-300 font-medium">{testimonial.helpDescription}</p>

                  <a
                    href={testimonial.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium hover:scale-105 transition-transform duration-300"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                    </svg>
                    {testimonial.followers}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`py-16 md:py-20 px-4 md:px-6 transition-all duration-1000 ease-out ${
          visibleElements.has("client-results") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        data-animate-id="client-results"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 px-2">
              More Client Success Stories
            </h2>
          </div>

          <div className="space-y-6 md:space-y-8 mb-12 md:mb-16">
            <div className="glass-strong rounded-2xl p-6 md:p-8 hover:scale-105 transition-all duration-500 group cursor-pointer border border-border">
              <div className="flex flex-row gap-6 md:gap-8 items-center">
                <div className="flex-shrink-0">
                  <img
                    src="/aj-yabut-sales-coach.png"
                    alt="AJ Yabut"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover mx-auto sm:mx-0 mb-4 md:mb-6"
                  />
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 mt-4 text-center">AJ Yabut</h3>
                  <div className="text-center">
                    <a
                      href="https://www.instagram.com/marcusrodriguez"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:scale-105 transition-transform duration-300"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                      </svg>
                      45K followers
                    </a>
                    <div className="mt-4 px-3 md:px-4 py-2 bg-gray-800/50 rounded-full">
                      <span className="text-gray-400 text-xs md:text-sm font-medium">45K followers</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="inline-block px-3 md:px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs md:text-sm font-medium mb-4">
                    Success Story #1
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-foreground mb-4">Results Achieved</h4>
                  <h5 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                    Generated 100K in 30 days completely organic
                  </h5>
                  <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                    Sales coach who experienced explosive growth by implementing our AI positioning and sales systems.
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm md:text-base text-green-400 font-medium">
                      Achieved through building a high performance sales team
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 md:p-8 hover:scale-105 transition-all duration-500 group cursor-pointer border border-border">
              <div className="flex flex-row gap-6 md:gap-8 items-center">
                <div className="flex-shrink-0">
                  <img
                    src="/dan-dating-coach-new.png"
                    alt="Dan"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover"
                  />
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 mt-4 text-center">DAN</h3>
                  <div className="text-center">
                    <a
                      href="https://www.instagram.com/dannesek?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:scale-105 transition-transform duration-300"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                      </svg>
                      118K followers
                    </a>
                    <div className="mt-2 px-3 md:px-4 py-1 bg-gray-800/50 rounded-full">
                      <span className="text-gray-400 text-xs md:text-sm font-medium">118K followers</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="inline-block px-3 md:px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs md:text-sm font-medium mb-4">
                    Success Story #2
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-foreground mb-4">Results Achieved</h4>
                  <h5 className="text-lg md:text-xl font-semibold text-foreground mb-4">Made $35,000 in 12 Days</h5>
                  <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                    #1 Dating coach for men who leveraged his massive following to generate high-ticket sales through
                    strategic positioning.
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm md:text-base text-green-400 font-medium">
                      Achieved through building a high performance sales team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            {[
              {
                name: "Lucas Elliot",
                title: "Fitness Coach",
                image: "/client-1-fitness-coach.png",
                instagramUrl: "https://www.instagram.com/lucaselliot",
                followers: "827K",
                result: "Helped make thousands with setters/closers",
                description:
                  "Fitness coach who experienced explosive growth by implementing our AI positioning and sales systems.",
                achievement: "Achieved through building a high performance sales team",
                storyNumber: 1,
              },
              {
                name: "Lucas Dasilva",
                title: "Fitness Coach",
                image: "/client-2-fitness-trainer.png",
                instagramUrl: "https://www.instagram.com/lucasdasilva",
                followers: "8.8M",
                result: "Made $10K with DM closes + 105 appointments in 10 days",
                description:
                  "Fitness influencer who leveraged his massive following to generate high-ticket sales through strategic positioning.",
                achievement: "Achieved through building a high performance sales team",
                storyNumber: 2,
              },
              {
                name: "Souad",
                title: "Life Coach",
                image: "/client-3-business-consultant.png",
                instagramUrl: "https://www.instagram.com/souad",
                followers: "704K",
                result: "Scaled to 30+ paying clients in 30 days",
                description: "Life coach who transformed her approach and scaled rapidly using our proven systems.",
                achievement: "Achieved through building a high performance sales team",
                storyNumber: 3,
              },
              {
                name: "Jacob Day",
                title: "Fitness Coach",
                image: "/client-4-sales-consultant.png",
                instagramUrl: "https://www.instagram.com/jacobday",
                followers: "903K",
                result: "Helped build high performance sales team",
                description: "Fitness coach who leveraged our systems to build and scale his sales operations.",
                achievement: "Achieved through building a high performance sales team",
                storyNumber: 4,
              },
            ].map((client, index) => (
              <div
                key={client.name}
                className={`glass-strong rounded-2xl p-6 md:p-8 hover:scale-105 transition-all duration-500 group cursor-pointer border border-border ${
                  visibleElements.has("client-results") ? "animate-slide-up" : ""
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                  <div className="flex-shrink-0 text-center sm:text-left">
                    <img
                      src={client.image || "/placeholder.svg"}
                      alt={client.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover mx-auto sm:mx-0 mb-4 md:mb-6"
                    />
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{client.name}</h3>
                    <a
                      href={client.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:scale-105 transition-transform duration-300"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
                      </svg>
                      {client.followers} followers
                    </a>
                    <div className="mt-4 px-3 md:px-4 py-2 bg-gray-800/50 rounded-full">
                      <span className="text-gray-400 text-xs md:text-sm font-medium">{client.followers} followers</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="inline-block px-3 md:px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs md:text-sm font-medium mb-4">
                      Success Story #{client.storyNumber}
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-foreground mb-4">Results Achieved</h4>
                    <h5 className="text-lg md:text-xl font-semibold text-foreground mb-4">{client.result}</h5>
                    <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
                      {client.description}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm md:text-base text-green-400 font-medium">{client.achievement}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`py-16 md:py-20 px-4 md:px-6 transition-all duration-1000 ease-out ${
          visibleElements.has("apply-cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        data-animate-id="apply-cta"
      >
        <div className="max-w-7xl mx-auto text-center">
          <button
            onClick={scrollToCalendly}
            className="inline-block text-white font-semibold py-4 px-6 md:px-8 rounded-full transition-all duration-500 text-base md:text-lg group relative overflow-hidden hover:scale-105 mx-2"
            style={{ backgroundColor: "#127CF5", boxShadow: "0 20px 40px -12px rgba(18, 124, 245, 0.4)" }}
          >
            <div className="relative flex items-center gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
                </svg>
              </div>
              Click Here to Increase your Sales
            </div>
          </button>
        </div>
      </section>

      <section
        className={`py-16 md:py-20 px-4 md:px-6 transition-all duration-1000 ease-out ${
          visibleElements.has("about-us") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        data-animate-id="about-us"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-glow px-2">About Us</h2>
            <p className="text-lg md:text-xl text-muted-foreground px-2">Meet the CEO of Sales Monarchs</p>
          </div>

          <div className="glass-strong rounded-2xl md:rounded-3xl p-6 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-float"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl animate-float animation-delay-300"></div>

            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start relative z-10">
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="relative group">
                  <img
                    src="/kishin-amerson-ceo.jpeg"
                    alt="Kishin Amerson"
                    className="w-64 h-64 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>

              <div className="flex-1 space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 text-center lg:text-left">
                    About{" "}
                    <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                      Kishin Amerson
                    </span>
                  </h3>
                  <div className="space-y-4 md:space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Kishin Amerson has become one of the fastest-rising figures in the sales and online business
                      space. In just 365 days, he has led multiple sales teams, generated over $5M in client revenue,
                      and scaled businesses to 6-figure months within 30–60 days — including brands that started with $0
                      in ad spend.
                    </p>
                    <p>
                      Recognized by AP News, Benzinga, and Barchart as the{" "}
                      <span className="text-blue-300 font-semibold">
                        #1 AI Positioning Expert for High-Ticket Online Businesses
                      </span>
                      , he is also the founder of Revenue-Driven AI SEO, a groundbreaking system designed to put
                      entrepreneurs at the very top of AI-driven search results.
                    </p>
                    <p>
                      With a track record of results and industry recognition, Kishin Amerson is known for bridging
                      high-performance sales with cutting-edge AI positioning strategies.
                    </p>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 md:p-8 border border-green-400/30">
                  <h4 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                    <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                      Track Record
                    </span>
                  </h4>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <p className="text-sm md:text-base text-foreground">
                        Generated <span className="text-green-400 font-bold">25M+ organic views</span> in just 4 months
                        through social media and content strategy
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <p className="text-sm md:text-base text-foreground">
                        Directly contributed to <span className="text-green-400 font-bold">$5M+ in client revenue</span>{" "}
                        from sales and marketing services in under two years
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <p className="text-sm md:text-base text-foreground">
                        Scaled businesses to{" "}
                        <span className="text-green-400 font-bold">6-figure months within 30-60 days</span>, including
                        brands starting with $0 ad spend
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`py-16 md:py-20 px-4 md:px-6 transition-all duration-1000 ease-out ${
          visibleElements.has("contact") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        data-animate-id="contact"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 md:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-glow px-2">
              Not ready to apply yet?{" "}
              <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Connect with me directly
              </span>{" "}
              — no gatekeepers, no forms.
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            <a
              href="https://wa.link/mghivh"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-strong rounded-2xl p-6 md:p-8 hover:scale-105 transition-all duration-500 group cursor-pointer border border-green-400/30"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-foreground mb-3">WhatsApp</h4>
              <p className="text-sm md:text-base text-muted-foreground">Get instant responses and direct access</p>
            </a>

            <a
              href="https://www.instagram.com/salespimp/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-strong rounded-2xl p-6 md:p-8 hover:scale-105 transition-all duration-500 group cursor-pointer border border-pink-400/30"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                </svg>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-foreground mb-3">Instagram</h4>
              <p className="text-sm md:text-base text-muted-foreground">Follow for daily insights and updates</p>
            </a>
          </div>

          <div className="mt-8 md:mt-12"></div>
        </div>
      </section>

      <section
        className={`py-16 md:py-20 px-4 md:px-6 transition-all duration-1000 ease-out ${
          visibleElements.has("final-cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        data-animate-id="final-cta"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 md:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 text-glow px-2">
              But if you are confident enough apply now
            </h3>
            <button
              onClick={scrollToCalendly}
              className="inline-block text-white font-semibold py-4 px-6 md:px-8 rounded-full transition-all duration-500 text-base md:text-lg group relative overflow-hidden hover:scale-105 mx-2"
              style={{ backgroundColor: "#127CF5", boxShadow: "0 20px 40px -12px rgba(18, 124, 245, 0.4)" }}
            >
              <div className="relative flex items-center gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:animate-pulse"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
                  </svg>
                </div>
                Click Here to Increase your Sales
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
