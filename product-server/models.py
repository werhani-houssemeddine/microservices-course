from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Order(db.Model):
  __tablename__ = 'orders'

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, nullable=False)
  total_price = db.Column(db.Float, nullable=False)
  order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
  archived = db.Column(db.Boolean, nullable=False, default=False)

  products = db.relationship('OrderProduct', backref='order', cascade='all, delete-orphan')


class OrderProduct(db.Model):
  __tablename__ = 'order_products'

  id = db.Column(db.Integer, primary_key=True)
  order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
  product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
  quantity = db.Column(db.Integer, nullable=False)
  price = db.Column(db.Float, nullable=False)  # snapshot of product price at order time

  # Snapshot fields
  product_name = db.Column(db.String(100), nullable=False)
  product_description = db.Column(db.Text, default='')
  product_image = db.Column(db.String(255), default='')

  product = db.relationship('Product', backref='order_links')


class Product(db.Model):
  __tablename__ = 'products'
  
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(100), nullable=False)
  description = db.Column(db.Text, default='')
  price = db.Column(db.Float, nullable=False)
  stock = db.Column(db.Integer, default=0)
  owner_id = db.Column(db.Integer, nullable=False)
  image = db.Column(db.String(255), default='')

  def to_dict(self):
    return {
      'id': self.id,
      'name': self.name,
      'description': self.description,
      'price': self.price,
      'stock': self.stock,
      'owner_id': self.owner_id,
      'image': self.image
    }

  def __repr__(self):
    return f'<Product {self.name}>'
