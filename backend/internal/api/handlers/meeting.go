package handlers

import (
	"backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MeetingHandler struct {
	MeetingService     *services.MeetingService
	AudioMergerService *services.AudioMergerService
}

func NewMeetingHandler(meetingService *services.MeetingService, audioMerger *services.AudioMergerService) *MeetingHandler {
	return &MeetingHandler{
		MeetingService:     meetingService,
		AudioMergerService: audioMerger,
	}
}

// GetAll returns all meetings
func (h *MeetingHandler) GetAll(c *gin.Context) {
	meetings, err := h.MeetingService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if meetings == nil {
		meetings = []services.Meeting{}
	}

	c.JSON(http.StatusOK, gin.H{"meetings": meetings})
}

// GetOne returns a single meeting
func (h *MeetingHandler) GetOne(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}

	meeting, err := h.MeetingService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if meeting == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meeting not found"})
		return
	}

	c.JSON(http.StatusOK, meeting)
}

// Create creates a new meeting
func (h *MeetingHandler) Create(c *gin.Context) {
	var req struct {
		Title string `json:"title"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		req.Title = "Untitled Meeting"
	}

	if req.Title == "" {
		req.Title = "Untitled Meeting"
	}

	meeting, err := h.MeetingService.Create(req.Title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, meeting)
}

// Update updates a meeting's title or notes
func (h *MeetingHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}

	var req struct {
		Title string `json:"title,omitempty"`
		Notes string `json:"notes,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.Title != "" {
		if err := h.MeetingService.UpdateTitle(id, req.Title); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if req.Notes != "" {
		if err := h.MeetingService.UpdateNotes(id, req.Notes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	meeting, _ := h.MeetingService.GetByID(id)
	c.JSON(http.StatusOK, meeting)
}

// Delete removes a meeting
func (h *MeetingHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}

	// Get meeting to find audio path
	meeting, _ := h.MeetingService.GetByID(id)
	if meeting != nil {
		// Clean up audio files
		h.AudioMergerService.CleanupMeeting(id, meeting.AudioPath)
	}

	if err := h.MeetingService.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Meeting deleted"})
}

// FinishRecording merges audio chunks and marks recording complete
func (h *MeetingHandler) FinishRecording(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}

	// Merge audio chunks
	audioPath, err := h.AudioMergerService.MergeChunks(id)
	if err != nil {
		// Not a fatal error - recording might have no audio
		audioPath = ""
	}

	// Update meeting
	if err := h.MeetingService.FinishRecording(id, audioPath, 0); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	meeting, _ := h.MeetingService.GetByID(id)
	c.JSON(http.StatusOK, meeting)
}
