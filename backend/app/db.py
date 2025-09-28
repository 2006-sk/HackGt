from sqlalchemy import create_engine, Column, String, Float, ForeignKey, JSON, DateTime, Integer, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./readm.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    patients = relationship("Patient", back_populates="customer", cascade="all, delete-orphan")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    status = Column(String, default="not_discharged")  # discharged / not_discharged
    customer_id = Column(String, ForeignKey("customers.id"), index=True, nullable=False)
    customer = relationship("Customer", back_populates="patients")
    predictions = relationship("Prediction", back_populates="patient", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), index=True, nullable=False)
    risk_score = Column(Float, nullable=False)
    band = Column(String, nullable=False)  # low/medium/high
    top_features = Column(JSON, nullable=False)
    explanation = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="predictions")
    nudges = relationship("Nudge", back_populates="prediction", cascade="all, delete-orphan")

class Nudge(Base):
    __tablename__ = "nudges"
    id = Column(Integer, primary_key=True, autoincrement=True)
    prediction_id = Column(String, ForeignKey("predictions.id"), index=True, nullable=False)
    suggestion = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    prediction = relationship("Prediction", back_populates="nudges")

Base.metadata.create_all(bind=engine)
