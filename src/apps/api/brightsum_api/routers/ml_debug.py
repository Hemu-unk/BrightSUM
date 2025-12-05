from __future__ import annotations

from typing import Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

# Import model helpers from the ml package
from brightsum_api.ml.hint_inference import _load_model, predict_hint_level

router = APIRouter()


class HintRequest(BaseModel):
	correct_rate_topic: float = Field(..., ge=0.0, le=1.0)
	avg_time_topic: float = Field(..., ge=0.0)
	base_difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
	mastery: float = Field(..., ge=0.0, le=1.0)
	hints_used_topic: float = Field(..., ge=0.0)
	hints_used_question: int = Field(..., ge=0)


class HintResponse(BaseModel):
	predicted_level: int
	probabilities: Dict[str, float]
	input: HintRequest


@router.post("/hint", response_model=HintResponse)
def predict_hint(req: HintRequest):
	"""Debug endpoint: return predicted hint level and class probabilities.

	This endpoint is intentionally simple and meant for frontend/dev/demo use.
	It does not require DB access and operates purely on the feature payload.
	"""
	# Use the helper prediction for the top-level predicted label
	pred = predict_hint_level(
		correct_rate_topic=req.correct_rate_topic,
		avg_time_topic=req.avg_time_topic,
		base_difficulty=req.base_difficulty,
		mastery=req.mastery,
		hints_used_topic=req.hints_used_topic,
		hints_used_question=req.hints_used_question,
	)

	# Load the trained pipeline to fetch probabilities
	model = _load_model()
	# Build a single-row DataFrame the same way the model expects
	import pandas as pd

	row = {
		"correct_rate_topic": float(req.correct_rate_topic),
		"avg_time_topic": float(req.avg_time_topic),
		"mastery": float(req.mastery),
		"hints_used_topic": float(req.hints_used_topic),
		"hints_used_question": int(req.hints_used_question),
		"base_difficulty": req.base_difficulty,
	}
	X = pd.DataFrame([row])

	proba = None
	try:
		proba = model.predict_proba(X)[0]
		classes = list(map(str, model.classes_.tolist()))
		prob_map = {classes[i]: float(proba[i]) for i in range(len(classes))}
	except Exception:
		# If the pipeline doesn't expose predict_proba, return an empty map
		prob_map = {}

	return HintResponse(predicted_level=int(pred), probabilities=prob_map, input=req)
